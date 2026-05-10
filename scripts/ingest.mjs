#!/usr/bin/env node
/**
 * Daily ingest: fetch NYT puzzle JSON (public endpoints + optional mini via NYT_S),
 * optionally call OpenAI for progressive hints, write data/days/YYYY-MM-DD.json
 *
 * Usage:
 *   npm run ingest -- --date 2026-05-10
 *   npm run ingest -- --from 2026-05-10 --days 7
 *   npm run ingest -- --month 2025-06 --concurrency 8
 *   npm run ingest -- --from 2025-05-11 --days 365 --concurrency 6
 *   npm run ingest -- --date 2026-05-10 --skip-openai
 *
 * Env:
 *   OPENAI_API_KEY   (optional if --skip-openai); loaded from .env / .env.local (same idea as Next.js)
 *   OPENAI_MODEL     default gpt-4o-mini
 *   NYT_S            cookie value for nytimes.com (optional; enables Mini Crossword)
 */

import { existsSync, readFileSync } from "fs";
import fsp from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "data", "days");

/** Plain Node does not load .env.local — .env then .env.local (local overrides). */
function loadEnvFiles() {
  const apply = (filePath, override) => {
    if (!existsSync(filePath)) return;
    const raw = readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
    for (let line of raw.split("\n")) {
      line = line.trim();
      if (!line || line.startsWith("#")) continue;
      if (line.startsWith("export ")) line = line.slice(7).trim();
      const eq = line.indexOf("=");
      if (eq === -1) continue;
      const key = line.slice(0, eq).trim();
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
      let val = line.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (override || process.env[key] === undefined) {
        process.env[key] = val;
      }
    }
  };
  apply(path.join(ROOT, ".env"), false);
  apply(path.join(ROOT, ".env.local"), true);
}

loadEnvFiles();

async function fetchJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; nyt.today-ingest/1.0; +https://nyt.today)",
      Accept: "application/json",
      ...headers,
    },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${url} → ${res.status} ${t.slice(0, 120)}`);
  }
  return res.json();
}

/** One bad NYT response should not abort a multi-day ingest run. */
async function fetchNytJsonSafe(url, label) {
  try {
    return { ok: true, data: await fetchJson(url) };
  } catch (e) {
    console.warn(`${label}: ${e.message}`);
    return { ok: false, error: e.message };
  }
}

function plainClueText(t) {
  if (typeof t === "string") return t.replace(/<[^>]+>/g, "").trim();
  if (Array.isArray(t)) return plainClueText(t[0]);
  if (t && typeof t === "object" && t.plain) return String(t.plain);
  return "";
}

function parseMiniBoard(raw) {
  const board = raw.body?.[0];
  if (!board?.cells || !board?.dimensions) return null;
  const w = board.dimensions.width;
  const h = board.dimensions.height;
  const rows = [];
  for (let y = 0; y < h; y++) {
    let row = "";
    for (let x = 0; x < w; x++) {
      const c = board.cells[y * w + x];
      if (c.type === 0) row += "#";
      else row += (c.answer && c.answer[0]) || ".";
    }
    rows.push(row);
  }

  const cluesOut = [];
  const seen = new Set();
  for (let i = 0; i < board.cells.length; i++) {
    const cell = board.cells[i];
    if (!cell.clues) continue;
    for (const cid of cell.clues) {
      const key = String(cid);
      if (seen.has(key)) continue;
      seen.add(key);
      const meta = board.clues?.[cid];
      if (!meta) continue;
      const d = meta.direction;
      const dir =
        d === "Down" || d === 1 || d === "down" ? "Down" : "Across";
      let x = i % w;
      let y = Math.floor(i / w);
      const dx = dir === "Across" ? 1 : 0;
      const dy = dir === "Across" ? 0 : 1;
      let cx = x;
      let cy = y;
      let word = "";
      while (cx < w && cy < h) {
        const idx = cy * w + cx;
        const tc = board.cells[idx];
        if (tc.type === 0) break;
        if (!tc.answer) break;
        word += tc.answer[0];
        cx += dx;
        cy += dy;
      }
      cluesOut.push({
        id: key,
        label: String(meta.label ?? meta.clueNum ?? ""),
        direction: dir,
        text: plainClueText(meta.text),
        answer: word,
      });
    }
  }

  return {
    rows,
    clues: cluesOut,
    puzzleId: raw.puzzle_id ?? board.id,
    title: raw.title,
  };
}

/** Spelling Bee sometimes returns 500 + {"Not Found"} for a date (not yet published, etc.). */
async function fetchSpellingBeeJson(date) {
  const url = `https://www.nytimes.com/svc/spelling-bee/v1/${date}.json`;
  try {
    return { ok: true, data: await fetchJson(url) };
  } catch (e) {
    console.warn(`Spelling Bee: ${e.message}`);
    return { ok: false, error: e.message };
  }
}

async function fetchMini(date, nytS) {
  if (!nytS) {
    return {
      rows: [],
      clues: [],
      fetchNote:
        "Mini needs NYT_S env: copy NYT-S cookie from a logged-in nytimes.com session.",
      hints: [],
    };
  }
  const url = `https://www.nytimes.com/svc/crosswords/v6/puzzle/mini/${date}.json`;
  try {
    const raw = await fetchJson(url, {
      Cookie: `NYT-S=${nytS}`,
    });
    const parsed = parseMiniBoard(raw);
    if (!parsed) throw new Error("Unexpected crossword JSON shape");
    return { ...parsed, hints: [] };
  } catch (e) {
    return {
      rows: [],
      clues: [],
      fetchNote: `Mini fetch failed: ${e.message}`,
      hints: [],
    };
  }
}

function normalizeConnections(j) {
  const groups = (j.categories || []).map((c) => ({
    title: c.title,
    words: (c.cards || []).map((x) => x.content).sort(),
  }));
  return {
    puzzleId: j.id,
    editor: j.editor,
    groups,
    groupHints: [],
    hints: [],
  };
}

async function bundleDay(date, nytS) {
  const base = `https://www.nytimes.com/svc`;
  const [cRes, wRes, sRes, spellingRes, bRes, mini] = await Promise.all([
    fetchNytJsonSafe(`${base}/connections/v2/${date}.json`, "Connections"),
    fetchNytJsonSafe(`${base}/wordle/v2/${date}.json`, "Wordle"),
    fetchNytJsonSafe(`${base}/strands/v2/${date}.json`, "Strands"),
    fetchSpellingBeeJson(date),
    fetchNytJsonSafe(`${base}/letter-boxed/v1/${date}.json`, "Letter Boxed"),
    fetchMini(date, nytS),
  ]);
  const spelling = spellingRes.ok ? spellingRes.data : null;

  const connections = cRes.ok
    ? normalizeConnections(cRes.data)
    : {
        puzzleId: undefined,
        editor: "",
        groups: [],
        groupHints: [],
        hints: [],
        fetchNote: `NYT Connections JSON not available: ${cRes.error}`,
      };

  const wordle = wRes.ok
    ? {
        puzzleId: wRes.data.id,
        editor: wRes.data.editor,
        solution: wRes.data.solution,
        hints: [],
      }
    : {
        puzzleId: undefined,
        editor: "",
        solution: "",
        hints: [],
        fetchNote: `NYT Wordle JSON not available: ${wRes.error}`,
      };

  const strands = sRes.ok
    ? {
        puzzleId: sRes.data.id,
        editor: sRes.data.editor,
        clue: sRes.data.clue,
        spangram: sRes.data.spangram,
        themeWords: sRes.data.themeWords || [],
        startingBoard: sRes.data.startingBoard || [],
        hints: [],
      }
    : {
        puzzleId: undefined,
        editor: "",
        clue: "",
        spangram: "",
        themeWords: [],
        startingBoard: [],
        hints: [],
        fetchNote: `NYT Strands JSON not available: ${sRes.error}`,
      };

  const boxed = bRes.ok
    ? {
        puzzleId: bRes.data.id,
        sides: bRes.data.sides,
        par: bRes.data.par,
        ourSolution: bRes.data.ourSolution,
        hints: [],
      }
    : {
        puzzleId: undefined,
        sides: ["   ", "   ", "   ", "   "],
        par: undefined,
        ourSolution: [],
        hints: [],
        fetchNote: `NYT Letter Boxed JSON not available: ${bRes.error}`,
      };

  const bundle = {
    date,
    fetchedAt: new Date().toISOString(),
    connections,
    wordle,
    strands,
    "letter-boxed": boxed,
    "spelling-bee": spelling
      ? {
          puzzleId: spelling.id,
          centerLetter: spelling.center_letter,
          outerLetters: spelling.outer_letters,
          pangrams: spelling.pangrams || [],
          answers: spelling.answers || [],
          pangramHints: [],
          hints: [],
        }
      : {
          centerLetter: "",
          outerLetters: "",
          pangrams: [],
          answers: [],
          pangramHints: [],
          hints: [],
          fetchNote: `Spelling Bee data was not available from the NYT API (${spellingRes.error}). Other games in this bundle are unchanged; re-run ingest when the puzzle is live or merge Spelling Bee from another source.`,
        },
    mini: {
      puzzleId: mini.puzzleId,
      title: mini.title,
      rows: mini.rows,
      clues: mini.clues,
      hints: mini.hints,
      fetchNote: mini.fetchNote,
    },
  };

  return bundle;
}

const HINT_SYSTEM = `Return valid JSON only (no markdown). Required keys and shapes:

{
  "connections": {
    "groupHints": [ "one cryptic hint per group in SAME order as input groups", "...×4" ]
  },
  "wordle": {
    "hints": [
      { "level": 1, "title": "", "body": "one short nudge" },
      { "level": 2, "title": "", "body": "a bit clearer" },
      { "level": 3, "title": "", "body": "strongest nudge but do NOT give the word or unique spelling" }
    ]
  },
  "mini": { "hints": [ four objects with level, title:"", body ] },
  "spellingBee": {
    "pangramHints": [
      { "word": "exact pangram spelling from input", "hint": "short nudge; never say the word" },
      ...
    ]
  }
}

Rules:
- connections.groupHints: exactly as many strings as groups (usually 4). Each: 1–2 sentences, playful/cryptic, like puzzle blogs. NEVER use any answer word or any word from that group's official title (case-insensitive). If connections input is unavailable, return "groupHints": [].
- wordle.hints: exactly THREE entries, levels 1–3, title always "". Craft excellent, concise hints: vivid but fair; do not name the solution or make it trivial. If wordle input is unavailable, return "hints": [].
- mini: four hint levels or [] if unavailable.
- spellingBee.pangramHints: one object per pangram from input; "word" must match exactly. Hints help without naming the word.

Do NOT return strands, letter-boxed, connections.hints array, spelling-bee top-level hints, or extra keys.
`;

async function openaiFillHints(bundle, skip) {
  if (skip) {
    normalizeConnectionGroupHints(bundle);
    normalizeAllHintShapes(bundle);
    return bundle;
  }
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    console.warn("OPENAI_API_KEY missing; writing bundle without AI hints.");
    return bundle;
  }
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const miniPayload =
    bundle.mini.clues?.length > 0
      ? {
          clues: bundle.mini.clues.map((c) => ({
            id: c.id,
            direction: c.direction,
            text: c.text,
            length: c.answer?.length,
          })),
        }
      : { unavailable: true, note: bundle.mini.fetchNote };

  const payloadForModel = {
    date: bundle.date,
    connections:
      bundle.connections.groups?.length > 0
        ? { groups: bundle.connections.groups }
        : { unavailable: true, note: bundle.connections.fetchNote || "" },
    wordle: bundle.wordle.solution
      ? {
          solution: bundle.wordle.solution,
          length: bundle.wordle.solution.length,
        }
      : { unavailable: true, note: bundle.wordle.fetchNote || "" },
    mini: miniPayload,
    spellingBee:
      bundle["spelling-bee"].pangrams?.length > 0
        ? {
            pangrams: bundle["spelling-bee"].pangrams,
            center: bundle["spelling-bee"].centerLetter,
            outer: bundle["spelling-bee"].outerLetters,
          }
        : { unavailable: true, note: bundle["spelling-bee"].fetchNote || "" },
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: HINT_SYSTEM },
        {
          role: "user",
          content: `Generate hints for:\n${JSON.stringify(payloadForModel)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI ${res.status}: ${err.slice(0, 500)}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI empty response");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("OpenAI did not return JSON");
  }

  bundle.connections.groupHints = Array.isArray(parsed.connections?.groupHints)
    ? parsed.connections.groupHints.map((s) => String(s || "").trim())
    : [];
  if (
    bundle.connections.groupHints.length === 0 &&
    Array.isArray(parsed.connections?.hints)
  ) {
    bundle.connections.groupHints = parsed.connections.hints
      .slice(0, bundle.connections.groups.length)
      .map((x) => String(x.body || "").trim());
  }
  normalizeConnectionGroupHints(bundle);
  bundle.connections.hints = [];

  bundle.wordle.hints = (parsed.wordle?.hints || []).slice(0, 3);

  bundle.mini.hints = parsed.mini?.hints || [];

  bundle["spelling-bee"].pangramHints = mergePangramHints(
    parsed,
    bundle,
  );
  bundle["spelling-bee"].hints = [];

  bundle.strands.hints = [];
  bundle["letter-boxed"].hints = [];

  normalizeAllHintShapes(bundle);

  return bundle;
}

function mergePangramHints(parsed, bundle) {
  const pangrams = bundle["spelling-bee"].pangrams || [];
  const raw =
    parsed.spellingBee?.pangramHints ||
    parsed["spelling-bee"]?.pangramHints ||
    [];
  if (!Array.isArray(raw) || raw.length === 0) {
    return pangrams.map((word) => ({ word, hint: "" }));
  }
  return pangrams.map((word, idx) => {
    const m =
      raw.find(
        (x) => String(x.word || "").toLowerCase() === word.toLowerCase(),
      ) || raw[idx];
    return {
      word,
      hint: String(m?.hint || "").trim(),
    };
  });
}

function normalizeConnectionGroupHints(bundle) {
  const g = bundle.connections;
  if (!g?.groups?.length) return;
  let gh = g.groupHints;
  if (!Array.isArray(gh)) gh = [];
  while (gh.length < g.groups.length) gh.push("");
  g.groupHints = gh.slice(0, g.groups.length);
}

/** Wordle 3 hints; mini steps; strip titles */
function normalizeAllHintShapes(bundle) {
  normalizeConnectionGroupHints(bundle);

  const wh = bundle.wordle?.hints;
  if (wh?.length) {
    bundle.wordle.hints = wh.slice(0, 3).map((h, i) => ({
      level: i + 1,
      title: "",
      body: String(h.body ?? "").replace(/\s+/g, " ").trim(),
    }));
  }

  const miniHints = bundle.mini?.hints;
  if (miniHints?.length) {
    bundle.mini.hints = miniHints.map((h, i) => ({
      level: h.level ?? i + 1,
      title: "",
      body: String(h.body ?? "").replace(/\s+/g, " ").trim(),
    }));
  }
}

function parseArgs() {
  const a = process.argv.slice(2);
  const get = (name) => {
    const i = a.indexOf(name);
    if (i === -1) return null;
    return a[i + 1] || null;
  };
  const has = (name) => a.includes(name);
  const concRaw = get("--concurrency") ?? get("-j");
  let concurrency = Number.parseInt(String(concRaw ?? "4"), 10);
  if (!Number.isFinite(concurrency) || concurrency < 1) concurrency = 4;
  concurrency = Math.min(32, concurrency);
  return {
    date: get("--date"),
    month: get("--month"),
    from: get("--from"),
    days: get("--days") ? Number(get("--days")) : null,
    concurrency,
    skipOpenai: has("--skip-openai"),
    help: has("--help") || has("-h"),
  };
}

/** @returns {string[] | null} every calendar day in month (UTC) */
function datesInCalendarMonth(yyyyMm) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(yyyyMm).trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  if (mo < 1 || mo > 12) return null;
  const dim = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const ym = `${m[1]}-${m[2]}`;
  const out = [];
  for (let d = 1; d <= dim; d++) {
    out.push(`${ym}-${String(d).padStart(2, "0")}`);
  }
  return out;
}

/**
 * Run async tasks over items with at most `limit` in flight (simple worker pool).
 */
async function runPool(items, limit, worker) {
  if (items.length === 0) return;
  let next = 0;
  const nWorkers = Math.min(limit, items.length);
  const workers = [];
  for (let w = 0; w < nWorkers; w++) {
    workers.push(
      (async () => {
        while (true) {
          const i = next++;
          if (i >= items.length) break;
          await worker(items[i], i);
        }
      })(),
    );
  }
  await Promise.all(workers);
}

function addDays(isoDate, n) {
  const d = new Date(isoDate + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const args = parseArgs();
  if (args.help) {
    console.log(`Usage:
  npm run ingest -- --date YYYY-MM-DD
  npm run ingest -- --month YYYY-MM
  npm run ingest -- --from YYYY-MM-DD --days 7
  npm run ingest -- --from YYYY-MM-DD --days 365 --concurrency 8
  npm run ingest -- -j 6   (same as --concurrency 6; default 4, max 32)
  npm run ingest -- --skip-openai
Env: OPENAI_API_KEY, OPENAI_MODEL, NYT_S (optional mini)`);
    process.exit(0);
  }

  let dates = [];
  if (args.date) dates.push(args.date);
  else if (args.month) {
    const expanded = datesInCalendarMonth(args.month);
    if (!expanded) {
      console.error("Bad --month (use YYYY-MM, e.g. 2025-06)");
      process.exit(1);
    }
    dates = expanded;
  } else if (
    args.from &&
    args.days != null &&
    Number.isFinite(args.days) &&
    args.days > 0
  ) {
    for (let i = 0; i < args.days; i++) dates.push(addDays(args.from, i));
  } else {
    const today = new Date().toISOString().slice(0, 10);
    dates.push(today);
  }

  for (const date of dates) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.error("Bad date:", date);
      process.exit(1);
    }
  }

  const nytS = process.env.NYT_S || process.env.NYT_S_COOKIE || "";
  await fsp.mkdir(OUT_DIR, { recursive: true });

  const { concurrency } = args;
  if (dates.length > 1) {
    console.log(
      `Ingest ${dates.length} days (${dates[0]} … ${dates[dates.length - 1]}), concurrency ${concurrency}`,
    );
  }

  await runPool(dates, concurrency, async (date) => {
    console.log(`[${date}] fetching …`);
    let bundle = await bundleDay(date, nytS);
    bundle = await openaiFillHints(bundle, args.skipOpenai);
    const out = path.join(OUT_DIR, `${date}.json`);
    await fsp.writeFile(out, JSON.stringify(bundle, null, 2), "utf8");
    console.log(`[${date}] wrote`, path.relative(ROOT, out));
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
