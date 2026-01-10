

/**
 * Filter array by predicate function
 */
export const filterBy = <T>(predicate: (item: T) => boolean) => 
  (items: T[]): T[] => items.filter(predicate);

/**
 * Sort array by date field (descending by default)
 */
export const sortByDate = <T>(
  getDate: (item: T) => Date | string,
  ascending: boolean = false
) => (items: T[]): T[] => {
  return [...items].sort((a, b) => {
    const dateA = new Date(getDate(a)).getTime();
    const dateB = new Date(getDate(b)).getTime();
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

/**
 * Sum array by numeric field
 */
export const sumBy = <T>(getValue: (item: T) => number) => 
  (items: T[]): number => items.reduce((sum, item) => sum + getValue(item), 0);

/**
 * Group array by key
 */
export const groupBy = <T, K extends string | number>(
  getKey: (item: T) => K
) => (items: T[]): Record<K, T[]> => {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

/**
 * Find first item matching predicate
 */
export const findBy = <T>(predicate: (item: T) => boolean) => 
  (items: T[]): T | undefined => items.find(predicate);

// ============================================
// Composition utilities
// ============================================

/**
 * Pipe functions left-to-right
 * Supports both same-type and type transformations
 */
export function pipe<T>(...fns: Array<(arg: T) => T>): (value: T) => T;
export function pipe<T, U, R>(
  fn1: (arg: T) => U,
  fn2: (arg: U) => R
): (value: T) => R;
export function pipe<T, U, V, R>(
  fn1: (arg: T) => U,
  fn2: (arg: U) => V,
  fn3: (arg: V) => R
): (value: T) => R;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pipe<T, R = T>(...fns: Array<(arg: any) => any>): (value: T) => R {
  return (value: T): R => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fns.reduce((acc: any, fn) => fn(acc), value) as R;
  };
}

/**
 * Compose functions right-to-left
 */
export const compose = <T>(...fns: Array<(arg: T) => T>) => 
  (value: T): T => fns.reduceRight((acc, fn) => fn(acc), value);

// ============================================
// Date utilities
// ============================================

/**
 * Get start of day
 */
export const startOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day
 */
export const endOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Check if date is today
 */
export const isToday = (date: Date | string): boolean => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

/**
 * Check if date is within range
 */
export const isWithinRange = (
  date: Date | string,
  start: Date,
  end: Date
): boolean => {
  const d = new Date(date);
  return d >= start && d <= end;
};

// ============================================
// Formatting utilities
// ============================================

/**
 * Format currency amount
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format ISO date string
 */
export const formatDate = (
  date: Date | string,
  locale: string = 'en-US'
): string => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ============================================
// Validation utilities
// ============================================

/**
 * Check if value is non-empty string
 */
export const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Check if value is valid enum member
 */
export const isValidEnumValue = <T extends Record<string, string>>(
  enumObj: T,
  value: unknown
): value is T[keyof T] => {
  return Object.values(enumObj).includes(value as T[keyof T]);
};
