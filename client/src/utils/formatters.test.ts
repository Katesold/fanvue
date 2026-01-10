import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatPaymentMethod,
  formatNumber,
  formatPercentage,
} from './formatters';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('formats EUR correctly', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56');
  });

  it('formats GBP correctly', () => {
    expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('formats large numbers with thousand separators', () => {
    expect(formatCurrency(1000000, 'USD')).toBe('$1,000,000.00');
  });

  it('rounds to 2 decimal places', () => {
    expect(formatCurrency(99.999, 'USD')).toBe('$100.00');
  });
});

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2024-06-15T10:30:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });

  it('handles different date formats', () => {
    const result = formatDate('2024-12-25');
    expect(result).toContain('Dec');
    expect(result).toContain('25');
  });
});

describe('formatDateTime', () => {
  it('formats date and time correctly', () => {
    const result = formatDateTime('2024-06-15T14:30:00Z');
    expect(result).toContain('Jun');
    expect(result).toContain('15');
    expect(result).toContain('2024');
  });
});

describe('formatPaymentMethod', () => {
  it('formats bank_transfer correctly', () => {
    expect(formatPaymentMethod('bank_transfer')).toBe('Bank Transfer');
  });

  it('formats paypal correctly', () => {
    expect(formatPaymentMethod('paypal')).toBe('PayPal');
  });

  it('formats stripe correctly', () => {
    expect(formatPaymentMethod('stripe')).toBe('Stripe');
  });

  it('returns original value for unknown methods', () => {
    expect(formatPaymentMethod('crypto')).toBe('crypto');
  });
});

describe('formatNumber', () => {
  it('formats number with thousand separators', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('handles decimal numbers', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
  });

  it('handles zero', () => {
    expect(formatNumber(0)).toBe('0');
  });
});

describe('formatPercentage', () => {
  it('formats decimal as percentage', () => {
    expect(formatPercentage(0.5)).toBe('50%');
  });

  it('formats with decimal places', () => {
    expect(formatPercentage(0.1234, 2)).toBe('12.34%');
  });

  it('handles zero', () => {
    expect(formatPercentage(0)).toBe('0%');
  });

  it('handles values over 100%', () => {
    expect(formatPercentage(1.5)).toBe('150%');
  });
});
