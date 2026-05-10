import type { Metadata } from "next";
import { Newsreader, DM_Sans } from "next/font/google";
import "./globals.css";
import { SiteShell } from "@/components/site-shell";
import { getSiteUrl } from "@/lib/site-url";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "nyt.today — Daily hints for NYT Games",
    template: "%s · nyt.today",
  },
  description:
    "Friendly hints and answers for Connections, Wordle, Strands, Letter Boxed, and Spelling Bee—open only what you need.",
  applicationName: "nyt.today",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon0.svg", type: "image/svg+xml" },
      { url: "/icon1.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: [{ url: "/favicon.ico", sizes: "48x48" }],
  },
  appleWebApp: {
    title: "nyt.today",
  },
  /** Google AdSense site verification (present on all routes via root layout). */
  other: {
    "google-adsense-account": "ca-pub-4513387203189693",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "nyt.today",
    title: "nyt.today — Daily hints for NYT Games",
    description:
      "Hints and answers for popular daily word games. Spoilers stay tucked away until you open them.",
  },
  twitter: {
    card: "summary_large_image",
    title: "nyt.today",
    description:
      "Hints and answers for Connections, Wordle, Strands, Spelling Bee, and Letter Boxed.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-[var(--foreground)]">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
