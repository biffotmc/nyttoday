"use client";

import type { LetterBoxedCell } from "@/lib/letter-boxed-path";
import { useLayoutEffect, useRef, useState, type Ref, type RefCallback } from "react";

/** NYT-style perimeter layout: salmon field, black-framed white square, letters on each side.
 *  Top / bottom / square share one width; left / right sit only beside the square so three
 *  side letters span the square height (not the whole stack). */

function LetterOnEdge({
  ch,
  dotPosition,
  anchorRef,
}: {
  ch: string;
  dotPosition: "below" | "above" | "right" | "left";
  /** Path lines anchor to this dot (toward the inner square), not the letter glyph. */
  anchorRef?: Ref<HTMLSpanElement>;
}) {
  const dot = (
    <span
      ref={anchorRef}
      className="h-2 w-2 shrink-0 rounded-full border border-black bg-white shadow-sm"
      aria-hidden
    />
  );
  const letter = <span className="letter-boxed-board__letter">{ch}</span>;
  if (dotPosition === "below") {
    return (
      <div className="flex min-h-0 flex-col items-center gap-1.5">
        {letter}
        {dot}
      </div>
    );
  }
  if (dotPosition === "above") {
    return (
      <div className="flex min-h-0 flex-col items-center gap-1.5">
        {dot}
        {letter}
      </div>
    );
  }
  if (dotPosition === "right") {
    return (
      <div className="flex min-h-0 items-center gap-1.5">
        {letter}
        {dot}
      </div>
    );
  }
  return (
    <div className="flex min-h-0 items-center gap-1.5">
      {dot}
      {letter}
    </div>
  );
}

/** Matches square row height only (flex stretch to square). */
const SIDE_GUTTER =
  "flex w-9 shrink-0 flex-col justify-between self-stretch py-0.5 sm:w-10";

function cellKey(side: number, idx: number) {
  return `${side}-${idx}`;
}

/** Distinct stroke colors on salmon field; first word is teal (not white). */
const PATH_STROKES = [
  "#0e7490",
  "#fde047",
  "#93c5fd",
  "#fda4af",
  "#86efac",
];

export function LetterBoxedBoard({
  sides,
  par,
  paths,
}: {
  sides: string[];
  par?: number | null;
  /** One polyline per revealed solution word (connector dots toward the square). */
  paths?: LetterBoxedCell[][];
}) {
  const topRaw = sides[0] ?? "";
  const rightRaw = sides[1] ?? "";
  const bottomRaw = sides[2] ?? "";
  const leftRaw = sides[3] ?? "";
  const top = (topRaw || "   ").toUpperCase().split("").slice(0, 3);
  const right = (rightRaw || "   ").toUpperCase().split("").slice(0, 3);
  const bottom = (bottomRaw || "   ").toUpperCase().split("").slice(0, 3);
  const left = (leftRaw || "   ").toUpperCase().split("").slice(0, 3);

  while (top.length < 3) top.push(" ");
  while (right.length < 3) right.push(" ");
  while (bottom.length < 3) bottom.push(" ");
  while (left.length < 3) left.push(" ");

  const wrapRef = useRef<HTMLDivElement>(null);
  const anchorRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [svgSize, setSvgSize] = useState({ w: 0, h: 0 });
  const [polylines, setPolylines] = useState<
    Array<{ points: string; stroke: string }>
  >([]);

  useLayoutEffect(() => {
    const root = wrapRef.current;
    const safePaths = paths?.filter((p) => p.length > 1) ?? [];
    if (!root || safePaths.length === 0) {
      setPolylines([]);
      setSvgSize({ w: 0, h: 0 });
      return;
    }

    const measure = () => {
      const rect = root.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;

      const lines: Array<{ points: string; stroke: string }> = [];
      safePaths.forEach((cells, pi) => {
        const pts: string[] = [];
        for (const { side, idx } of cells) {
          const el = anchorRefs.current[cellKey(side, idx)];
          if (!el) continue;
          const er = el.getBoundingClientRect();
          const x = er.left + er.width / 2 - rect.left;
          const y = er.top + er.height / 2 - rect.top;
          pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
        }
        if (pts.length > 1) {
          lines.push({
            points: pts.join(" "),
            stroke: PATH_STROKES[pi % PATH_STROKES.length] ?? PATH_STROKES[0],
          });
        }
      });

      setSvgSize({ w: rect.width, h: rect.height });
      setPolylines(lines);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [paths]);

  /** Connector-dot refs (path endpoints face inward toward the square). */
  const setAnchorRef = (side: number, idx: number): RefCallback<HTMLSpanElement> => {
    const key = cellKey(side, idx);
    return (el) => {
      anchorRefs.current[key] = el;
    };
  };

  return (
    <div className="letter-boxed-board rounded-2xl px-3 py-7 font-sans sm:px-6">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-white/90">
        Letter Boxed
      </p>
      {par != null && (
        <p className="mt-1 text-center text-sm font-medium text-white/85">par {par}</p>
      )}

      <div
        ref={wrapRef}
        className="relative mx-auto mt-6 flex w-full max-w-[360px] flex-col items-center gap-2"
        role="img"
        aria-label={`Letter Boxed sides: top ${topRaw}, right ${rightRaw}, bottom ${bottomRaw}, left ${leftRaw}`}
      >
        {svgSize.w > 0 && polylines.length > 0 && (
          <svg
            className="pointer-events-none absolute inset-0 z-10 overflow-visible"
            width={svgSize.w}
            height={svgSize.h}
            aria-hidden
          >
            {polylines.map((pl, i) => (
              <polyline
                key={i}
                fill="none"
                stroke={pl.stroke}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pl.points}
              />
            ))}
          </svg>
        )}

        <div className="letter-boxed-board__max-w flex w-full justify-between px-0.5">
          {top.map((ch, i) => (
            <div key={`t-${i}`} className="flex justify-center">
              <LetterOnEdge
                ch={ch.trim() || "·"}
                dotPosition="below"
                anchorRef={setAnchorRef(0, i)}
              />
            </div>
          ))}
        </div>

        <div className="flex w-full items-stretch justify-center gap-1.5 sm:gap-2">
          <div className={SIDE_GUTTER}>
            {left.map((ch, i) => (
              <div key={`l-${i}`} className="flex justify-center">
                <LetterOnEdge
                  ch={ch.trim() || "·"}
                  dotPosition="right"
                  anchorRef={setAnchorRef(3, i)}
                />
              </div>
            ))}
          </div>

          <div className="letter-boxed-board__square letter-boxed-board__max-w shrink-0" />

          <div className={SIDE_GUTTER}>
            {right.map((ch, i) => (
              <div key={`r-${i}`} className="flex justify-center">
                <LetterOnEdge
                  ch={ch.trim() || "·"}
                  dotPosition="left"
                  anchorRef={setAnchorRef(1, i)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="letter-boxed-board__max-w flex w-full justify-between px-0.5">
          {bottom.map((ch, i) => (
            <div key={`b-${i}`} className="flex justify-center">
              <LetterOnEdge
                ch={ch.trim() || "·"}
                dotPosition="above"
                anchorRef={setAnchorRef(2, i)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
