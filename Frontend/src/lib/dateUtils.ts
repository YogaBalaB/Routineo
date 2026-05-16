// Parses a date string safely without timezone shift
export function parseDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;

  // If it's a date-only string like "2026-05-16", parse as local date
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split("-").map(Number);
    return new Date(y, m - 1, d); // local midnight, no UTC shift
  }

  // If it's a datetime string without Z, treat as UTC
  if (!dateStr.endsWith("Z") && !dateStr.includes("+")) {
    return new Date(dateStr + "Z");
  }

  return new Date(dateStr);
}

// Format a date for display
export function formatDate(
  dateStr: string | null | undefined,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  const d = parseDate(dateStr);
  if (!d || isNaN(d.getTime())) return "Invalid date";
  return d.toLocaleDateString(undefined, opts);
}

// Get today's date as YYYY-MM-DD for input[type=date]
export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}