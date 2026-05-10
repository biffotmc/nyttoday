import Link from "next/link";
import { latestDate, listAvailableDates } from "@/lib/data";
import { HeaderNav } from "@/components/header-nav";
import { Separator } from "@radix-ui/react-separator";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const dates = await listAvailableDates();
  const last = latestDate(dates);

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-3.5">
          <div className="flex items-center justify-between gap-3 sm:justify-start">
            <Link
              href="/"
              className="font-serif text-[1.35rem] font-semibold tracking-tight text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 focus-visible:ring-offset-2 rounded-sm"
            >
              nyt.today
            </Link>
          </div>
          <HeaderNav lastDate={last} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-12">{children}</main>
      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-10">
        <div className="mx-auto max-w-5xl px-4">
          <Separator
            decorative
            className="mb-8 h-px w-full shrink-0 bg-[var(--border)]"
          />
          <p className="text-center text-xs leading-relaxed text-[var(--muted)]">
            © {new Date().getFullYear()} nyt.today — Not affiliated with{" "}
            <span className="whitespace-nowrap">The New York Times</span>.
          </p>
        </div>
      </footer>
    </div>
  );
}
