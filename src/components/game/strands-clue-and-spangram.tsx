"use client";

import { StrandsSpangramReveal } from "@/components/game/strands-spangram-reveal";
import type { StrandsCell } from "@/lib/strands-path";
import { findSpangramPath } from "@/lib/strands-path";
import { cn } from "@/lib/cn";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

function StrandsLetterGrid({
  board,
  path,
}: {
  board: string[];
  path: StrandsCell[] | null;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const [linePts, setLinePts] = useState<string>("");

  const pathKeys = useMemo(() => {
    if (!path?.length) return new Set<string>();
    return new Set(path.map((p) => `${p.row},${p.col}`));
  }, [path]);

  useLayoutEffect(() => {
    const root = gridRef.current;
    if (!root || !path || path.length < 2) {
      setLinePts("");
      setSvgSize({ w: 0, h: 0 });
      return;
    }

    const measure = () => {
      const rect = root.getBoundingClientRect();
      if (rect.width < 1) return;

      const pts: string[] = [];
      for (const { row, col } of path) {
        const el = cellRefs.current[`${row}-${col}`];
        if (!el) continue;
        const er = el.getBoundingClientRect();
        const x = er.left + er.width / 2 - rect.left;
        const y = er.top + er.height / 2 - rect.top;
        pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }
      if (pts.length > 1) {
        setSvgSize({ w: rect.width, h: rect.height });
        setLinePts(pts.join(" "));
      } else {
        setLinePts("");
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [path]);

  const setCellRef = (r: number, c: number) => (el: HTMLDivElement | null) => {
    cellRefs.current[`${r}-${c}`] = el;
  };

  return (
    <div className="mt-5 overflow-x-auto rounded-xl bg-[var(--surface-2)] p-4 ring-1 ring-[var(--border)]">
      <div ref={gridRef} className="relative inline-block">
        {svgSize.w > 0 && linePts && (
          <svg
            className="pointer-events-none absolute inset-0 z-10 overflow-visible"
            width={svgSize.w}
            height={svgSize.h}
            aria-hidden
          >
            <polyline
              fill="none"
              stroke="var(--accent)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              points={linePts}
            />
          </svg>
        )}

        <div className="font-mono text-sm leading-normal tracking-widest text-[var(--foreground)]">
          {board.map((row, r) => (
            <div key={r} className="flex gap-1">
              {row.split("").map((ch, c) => {
                const onPath = pathKeys.has(`${r},${c}`);
                return (
                  <div
                    key={`${r}-${c}`}
                    ref={setCellRef(r, c)}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--surface)] text-center text-xs font-semibold uppercase shadow-sm ring-1 ring-[var(--border)]",
                      onPath &&
                        "relative z-[1] bg-[var(--accent-soft)] ring-2 ring-[var(--accent)]/55",
                    )}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Clue + playable grid (spangram path after full reveal) + spangram letter tiles */
export function StrandsClueAndSpangram({
  clue,
  startingBoard,
  spangram,
}: {
  clue: string;
  startingBoard?: string[];
  spangram: string;
}) {
  const lettersLen = useMemo(
    () => spangram.toUpperCase().replace(/[^A-Z]/g, "").length,
    [spangram],
  );
  const [revealedCount, setRevealedCount] = useState(0);

  const highlightPath = useMemo(() => {
    if (!startingBoard?.length || revealedCount < lettersLen || lettersLen === 0) {
      return null;
    }
    return findSpangramPath(startingBoard, spangram);
  }, [startingBoard, spangram, revealedCount, lettersLen]);

  const board = startingBoard?.filter(Boolean) ?? [];

  return (
    <>
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
          Puzzle clue
        </p>
        <p className="mt-2 font-serif text-xl font-semibold text-[var(--foreground)]">{clue}</p>
        {board.length > 0 ? (
          <StrandsLetterGrid board={board} path={highlightPath} />
        ) : null}
      </div>

      <div>
        <h2 className="font-serif text-2xl font-semibold">Spangram</h2>
        <div className="mt-4">
          <StrandsSpangramReveal spangram={spangram} onRevealCountChange={setRevealedCount} />
        </div>
      </div>
    </>
  );
}
