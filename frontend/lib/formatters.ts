/**
 * Formats minutes into a human-readable string (e.g. 1,240 min).
 */
export function formatMinutes(minutes: number): string {
  if (!Number.isFinite(minutes)) return '-';
  return `${Math.round(minutes).toLocaleString()} min`;
}

/**
 * Formats hours into a human-readable string (e.g. 120.5 hrs).
 */
export function formatHours(hours: number): string {
  if (!Number.isFinite(hours)) return '-';
  return `${hours.toFixed(1)} hrs`;
}

/**
 * Formats currency values in Indian Rupees (INR) format (e.g. ₹24,00,000).
 */
export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats currency values in Indian Rupees (INR) format with abbreviations (e.g. ₹2.4L).
 * Retained for backward compatibility.
 */
export function formatCurrency(value: number): string {
  if (value === 0) return "₹0";
  if (value >= 100000) {
    const lakhs = value / 100000;
    return `₹${lakhs.toFixed(2)}L`;
  }
  return formatINR(value);
}

/**
 * Formats an ISO datetime string into a readable date (e.g. Oct 8, 2025).
 */
export function formatDate(isoString: string | null): string {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  } catch {
    return isoString;
  }
}
