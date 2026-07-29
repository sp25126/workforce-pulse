/**
 * Formats hours into a human-readable string (e.g. 120.5h or 45m).
 */
export function formatHours(hours: number): string {
  if (hours === 0) return "0h";
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins}m`;
  }
  return `${hours.toFixed(1)}h`;
}

/**
 * Formats currency values in Indian Rupees (INR) format (e.g. ₹24,00,000 or ₹2.4L).
 */
export function formatCurrency(value: number): string {
  if (value === 0) return "₹0";
  
  // Format as Lakhs if it is large
  if (value >= 100000) {
    const lakhs = value / 100000;
    return `₹${lakhs.toFixed(2)}L`;
  }
  
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
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
