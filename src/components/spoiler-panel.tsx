"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import type { ReactNode } from "react";
import posthog from "posthog-js";
import { cn } from "@/lib/cn";

export function SpoilerPanel({
  title,
  eyebrow,
  children,
  variant = "default",
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  variant?: "default" | "danger";
}) {
  const surface = cn(
    "rounded-2xl border shadow-[var(--shadow)] outline-none",
    variant === "danger"
      ? "border-[var(--warn-border)] bg-[var(--warn-bg)]"
      : "border-[var(--border)] bg-[var(--surface)]",
  );

  return (
    <Collapsible.Root
      className={surface}
      onOpenChange={(open) => {
        if (open) posthog.capture("spoiler_panel_opened", { title, eyebrow });
      }}
    >
      <Collapsible.Trigger
        className={cn(
          "group flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left font-semibold text-[var(--foreground)]",
          "outline-none hover:bg-black/[0.02] focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 dark:hover:bg-white/[0.03]",
          "rounded-2xl data-[state=open]:rounded-b-none data-[state=open]:rounded-t-2xl",
        )}
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          {eyebrow && (
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              {eyebrow}
            </span>
          )}
          {title}
        </span>
        <span
          aria-hidden
          className="shrink-0 text-[var(--accent)] transition-transform duration-200 ease-out group-data-[state=open]:rotate-180"
        >
          ▼
        </span>
      </Collapsible.Trigger>
      <Collapsible.Content className="collapsible-spoiler overflow-hidden">
        <div className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed">
          {children}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
