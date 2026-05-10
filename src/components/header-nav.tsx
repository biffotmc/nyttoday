"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { GAME_LABEL, GAME_SLUGS } from "@/lib/types";
import { gameTodayVanityPath } from "@/lib/game-vanity-paths";
import { cn } from "@/lib/cn";

const pill =
  "rounded-full border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-medium text-[var(--foreground)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)] outline-none";

export function HeaderNav({ lastDate }: { lastDate?: string }) {
  const toGame = (slug: (typeof GAME_SLUGS)[number]) =>
    lastDate ? gameTodayVanityPath(slug) : `/games/${slug}`;

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          className={cn(
            pill,
            "inline-flex items-center gap-1 sm:hidden",
            "focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40",
          )}
        >
          All games
          <span aria-hidden className="text-[10px] opacity-70">
            ▾
          </span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[13.5rem] rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow)]"
            sideOffset={8}
            align="end"
          >
            {GAME_SLUGS.map((slug) => (
              <DropdownMenu.Item key={slug} asChild>
                <Link
                  href={toGame(slug)}
                  className="flex cursor-pointer rounded-lg px-3 py-2.5 text-sm outline-none select-none data-[highlighted]:bg-[var(--surface-2)]"
                >
                  {GAME_LABEL[slug]}
                </Link>
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Separator className="my-1 h-px bg-[var(--border)]" />
            <DropdownMenu.Item asChild>
              <Link
                href="/games"
                className="flex cursor-pointer rounded-lg px-3 py-2.5 text-sm font-semibold text-[var(--accent)] outline-none select-none data-[highlighted]:bg-[var(--accent-soft)]"
              >
                Archive
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <nav className="hidden flex-wrap items-center justify-end gap-1.5 sm:flex">
        {GAME_SLUGS.map((slug) => (
          <Link key={slug} href={toGame(slug)} className={pill}>
            {GAME_LABEL[slug]}
          </Link>
        ))}
        <Link
          href="/games"
          className="rounded-full px-2.5 py-1 text-xs font-semibold text-[var(--accent)] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40"
        >
          Archive
        </Link>
      </nav>
    </div>
  );
}
