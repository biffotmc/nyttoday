/** NYT-style group order: yellow (easiest) → purple (hardest).
 *
 * Color styling lives in `globals.css` as `.connections-*` classes so it always applies
 * on hard reload. Tailwind often omits utilities that only appear as JS object values
 * (e.g. `style.bg`), which made panels fall through to the dark page background. */

export const CONNECTIONS_GROUP_STYLES = [
  {
    key: "yellow",
    label: "Yellow",
    card: "connections-card--yellow",
    bar: "connections-bar--yellow",
    labelClass: "connections-title--yellow",
    wordPill: "connections-pill--yellow",
  },
  {
    key: "green",
    label: "Green",
    card: "connections-card--green",
    bar: "connections-bar--green",
    labelClass: "connections-title--green",
    wordPill: "connections-pill--green",
  },
  {
    key: "blue",
    label: "Blue",
    card: "connections-card--blue",
    bar: "connections-bar--blue",
    labelClass: "connections-title--blue",
    wordPill: "connections-pill--blue",
  },
  {
    key: "purple",
    label: "Purple",
    card: "connections-card--purple",
    bar: "connections-bar--purple",
    labelClass: "connections-title--purple",
    wordPill: "connections-pill--purple",
  },
] as const;
