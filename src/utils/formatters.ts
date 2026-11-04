/**
 * Currency & Metric Formatters for MONARCH Haute Couture Admin Panel
 */

export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹ 0';
  }

  // Format using standard Indian numbering system (e.g., 1,00,000)
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);

  return `₹ ${formatted}`;
}

export function formatCompactINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹ 0';
  }

  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)} L`;
  }
  if (amount >= 1000) {
    return `₹ ${(amount / 1000).toFixed(1)} K`;
  }

  return formatINR(amount);
}

export function formatDate(
  dateString: string | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString(
      'en-IN',
      options || {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}
