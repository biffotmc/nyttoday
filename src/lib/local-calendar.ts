/**
 * `YYYY-MM-DD` in the **runtime** local timezone. In the browser this is the visitor’s
 * device calendar day. Safe to import from Client Components (no Node/fs).
 */
export function calendarDateLocal(instant: Date = new Date()): string {
  const y = instant.getFullYear();
  const m = String(instant.getMonth() + 1).padStart(2, "0");
  const d = String(instant.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
