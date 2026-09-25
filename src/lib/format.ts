export function naira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function todayIso(): string {
  return new Date().toISOString();
}

export function todayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function nextSerial(prefix: string, ids: string[]): string {
  const year = new Date().getFullYear();
  const nums = ids.map((id) => {
    const match = id.match(/(\d+)$/);
    return match ? Number(match[1]) : 0;
  });
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  if (prefix === "LYR" || prefix === "DOC" || prefix === "ACT" || prefix === "HRG") {
    return `${prefix}-${String(next).padStart(3, "0")}`;
  }
  return `${prefix}-${year}-${String(next).padStart(4, "0")}`;
}
