// src/lib/format.ts
// Number / currency formatting helpers (PKR)

export function formatPKR(amount: number): string {
  if (!amount && amount !== 0) return "PKR 0";
  if (amount >= 1_000_000) {
    return `PKR ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (amount >= 1_000) {
    return `PKR ${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}K`;
  }
  return `PKR ${amount.toLocaleString()}`;
}

export function formatPKRFull(amount: number): string {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
