/**
 * Deterministic date and time formatters that produce identical output
 * on both Server (SSR Node.js) and Client (Browser in any locale / timezone).
 */

export function formatIsoDate(dateStr?: string | null): string {
  if (!dateStr) return '2026-08-22';
  try {
    if (dateStr.includes('T')) {
      return dateStr.split('T')[0];
    }
    if (dateStr.length >= 10) {
      return dateStr.slice(0, 10);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '2026-08-22' : d.toISOString().slice(0, 10);
  } catch {
    return '2026-08-22';
  }
}

export function formatIsoTime(dateStr?: string | null): string {
  if (!dateStr) return '12:00 UTC';
  try {
    if (dateStr.includes('T')) {
      const timePart = dateStr.split('T')[1];
      if (timePart && timePart.length >= 5) {
        return `${timePart.slice(0, 5)} UTC`;
      }
    }
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '12:00 UTC';
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    return `${hours}:${minutes} UTC`;
  } catch {
    return '12:00 UTC';
  }
}
