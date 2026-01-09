/**
 * Currency formatting utility
 * @param amount - The numeric amount to format
 * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @param locale - BCP 47 language tag (defaults to 'en-US')
 */
export const formatCurrency = (
  amount: number,
  currency: string,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Date formatting utility
 * @param dateString - ISO 8601 date string
 * @param options - Intl.DateTimeFormatOptions
 * @param locale - BCP 47 language tag (defaults to 'en-US')
 */
export const formatDate = (
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
  locale: string = 'en-US'
): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, options);
};

/**
 * Date and time formatting utility
 * @param dateString - ISO 8601 date string
 * @param locale - BCP 47 language tag (defaults to 'en-US')
 */
export const formatDateTime = (
  dateString: string,
  locale: string = 'en-US'
): string => {
  const date = new Date(dateString);
  return date.toLocaleString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Relative time formatting (e.g., "2 hours ago")
 * @param dateString - ISO 8601 date string
 * @param locale - BCP 47 language tag (defaults to 'en-US')
 */
export const formatRelativeTime = (
  dateString: string,
  locale: string = 'en-US'
): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }
  if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  }
  if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  }
  if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }
  return formatDate(dateString);
};

/**
 * Payment method display name mapping
 */
const PAYMENT_METHODS: Readonly<Record<string, string>> = {
  bank_transfer: 'Bank Transfer',
  paypal: 'PayPal',
  stripe: 'Stripe',
} as const;

/**
 * Format payment method for display
 * @param method - Payment method key
 */
export const formatPaymentMethod = (method: string): string => {
  return PAYMENT_METHODS[method] ?? method;
};

/**
 * Format number with thousand separators
 * @param num - Number to format
 * @param locale - BCP 47 language tag (defaults to 'en-US')
 */
export const formatNumber = (
  num: number,
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale).format(num);
};

/**
 * Format percentage
 * @param value - Decimal value (0.5 = 50%)
 * @param decimals - Number of decimal places
 */
export const formatPercentage = (
  value: number,
  decimals: number = 0
): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};
