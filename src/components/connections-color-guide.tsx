export function ConnectionsColorGuide() {
  const rows = [
    {
      name: "Yellow",
      desc: "Usually the most straightforward group.",
      swatch: "bg-[#f5d200]",
    },
    {
      name: "Green",
      desc: "Still fairly gettable — often pop culture or loose ties.",
      swatch: "bg-[#7dcc7a]",
    },
    {
      name: "Blue",
      desc: "Trickier — trivia, wordplay, or a twist.",
      swatch: "bg-[#8fc8f7]",
    },
    {
      name: "Purple",
      desc: "Hardest — expect a pun, twist, or obscure link.",
      swatch: "bg-[#b794f4]",
    },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <h3 className="font-serif text-lg font-semibold text-[var(--foreground)]">
        How Connections difficulty colors work
      </h3>
      <p className="mt-1 text-sm text-[var(--muted)]">
        The Times tags each solved group with a color — rough guide below.
      </p>
      <ul className="mt-4 space-y-3">
        {rows.map((r) => (
          <li key={r.name} className="flex gap-3 text-sm">
            <span
              className={`mt-0.5 h-8 w-2 shrink-0 rounded-full ${r.swatch} ring-1 ring-black/10`}
            />
            <div>
              <span className="font-semibold text-[var(--foreground)]">{r.name}</span>
              <span className="text-[var(--muted)]"> — {r.desc}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
