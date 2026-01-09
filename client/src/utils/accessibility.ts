/**
 * Accessibility utility functions for AAA compliance
 */

/**
 * Generate unique IDs for ARIA relationships
 */
let idCounter = 0;
export const generateId = (prefix: string = 'id'): string => {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
};

/**
 * Screen reader only text (visually hidden but accessible)
 */
export const srOnlyStyles: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

/**
 * Announce message to screen readers
 * @param message - Message to announce
 * @param priority - 'polite' or 'assertive'
 */
export const announceToScreenReader = (
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  Object.assign(announcement.style, srOnlyStyles);
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement is made
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Trap focus within an element (for modals/dialogs)
 * @param containerElement - The container to trap focus within
 */
export const trapFocus = (containerElement: HTMLElement): (() => void) => {
  const focusableElements = containerElement.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  const handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  };

  containerElement.addEventListener('keydown', handleKeyDown);
  firstElement?.focus();

  // Return cleanup function
  return () => {
    containerElement.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Get appropriate aria-label for status
 */
export const getStatusAriaLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: 'Status: Pending - awaiting processing',
    flagged: 'Status: Flagged - requires review',
    approved: 'Status: Approved - ready for payment',
    paid: 'Status: Paid - payment completed',
    rejected: 'Status: Rejected - payment denied',
    held: 'Status: Held - temporarily paused',
  };
  return labels[status] ?? `Status: ${status}`;
};

/**
 * Get risk score aria label
 */
export const getRiskScoreAriaLabel = (score: number): string => {
  if (score <= 25) return `Risk score: ${score} out of 100, low risk`;
  if (score <= 50) return `Risk score: ${score} out of 100, medium risk`;
  if (score <= 75) return `Risk score: ${score} out of 100, high risk`;
  return `Risk score: ${score} out of 100, critical risk`;
};
