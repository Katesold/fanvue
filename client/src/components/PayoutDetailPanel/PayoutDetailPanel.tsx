import { useState, useCallback, useEffect, useRef, useId } from 'react';
import { usePayoutDetails, useCreateDecision } from '../../hooks';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { trapFocus, announceToScreenReader } from '../../utils/accessibility';
import StatusBadge from '../StatusBadge';
import RiskScore from '../RiskScore';
import type { Payout, DecisionRequest } from '../../types';
import styles from './PayoutDetailPanel.module.scss';

interface PayoutDetailPanelProps {
  payout: Payout;
  onClose: () => void;
}

type DecisionType = 'approved' | 'rejected' | 'held';

const PayoutDetailPanel = ({ payout, onClose }: PayoutDetailPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const [decision, setDecision] = useState<DecisionType | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch detailed payout data
  const { 
    data: details, 
    isLoading, 
    error: fetchError 
  } = usePayoutDetails(payout.id);

  // Decision mutation with optimistic updates
  const { 
    mutate: submitDecision, 
    isPending: isSubmitting,
    isSuccess,
    reset: resetMutation,
  } = useCreateDecision();

  // Trap focus within panel and handle escape key
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const cleanup = trapFocus(panel);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      cleanup();
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Announce panel open to screen readers
  useEffect(() => {
    announceToScreenReader(`Payout details panel opened for ${payout.id}`, 'polite');
  }, [payout.id]);

  const handleDecisionSelect = useCallback((type: DecisionType) => {
    setDecision(type);
    setError(null);
    resetMutation();
  }, [resetMutation]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!decision) {
      setError('Please select a decision');
      return;
    }

    if (decision === 'rejected' && !reason.trim()) {
      setError('A reason is required when rejecting a payout');
      return;
    }

    const decisionRequest: DecisionRequest = {
      decision,
      reason: reason.trim() || undefined,
      decidedBy: 'ops-user-001', // In production, get from auth context
    };

    submitDecision(
      { payoutId: payout.id, decision: decisionRequest },
      {
        onSuccess: () => {
          announceToScreenReader(`Payout ${decision} successfully`, 'polite');
          setTimeout(() => {
            onClose();
          }, 1500);
        },
        onError: (err) => {
          setError((err as Error).message || 'Failed to submit decision');
          announceToScreenReader('Decision failed. Please try again.', 'assertive');
        },
      }
    );
  }, [decision, reason, payout.id, submitDecision, onClose]);

  const canTakeAction = payout.status !== 'paid' && payout.status !== 'rejected';

  return (
    <div 
      className={styles.overlay} 
      onClick={onClose}
      role="presentation"
    >
      <aside
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${panelId}-title`}
        aria-describedby={`${panelId}-description`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h2 id={`${panelId}-title`} className={styles.title}>
              Payout Details
            </h2>
            <p id={`${panelId}-description`} className={styles.subtitle}>
              {payout.id}
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close panel"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Loading state */}
        {isLoading && (
          <div className={styles.loading} role="status" aria-live="polite">
            <div className={styles.spinner} aria-hidden="true" />
            <span>Loading details...</span>
          </div>
        )}

        {/* Error state */}
        {fetchError && (
          <div className={styles.errorState} role="alert">
            <p>Failed to load payout details</p>
            <p className={styles.errorMessage}>{(fetchError as Error).message}</p>
          </div>
        )}

        {/* Content */}
        {details && !isLoading && (
          <div className={styles.content}>
            {/* Summary Section */}
            <section className={styles.section} aria-labelledby={`${panelId}-summary`}>
              <h3 id={`${panelId}-summary`} className={styles.sectionTitle}>Summary</h3>
              <dl className={styles.definitionList}>
                <div className={styles.definitionItem}>
                  <dt>Creator</dt>
                  <dd>{details.creator?.displayName || details.creatorId}</dd>
                </div>
                <div className={styles.definitionItem}>
                  <dt>Amount</dt>
                  <dd className={styles.amount}>{formatCurrency(details.amount, details.currency)}</dd>
                </div>
                <div className={styles.definitionItem}>
                  <dt>Status</dt>
                  <dd><StatusBadge status={details.status} /></dd>
                </div>
                <div className={styles.definitionItem}>
                  <dt>Risk Score</dt>
                  <dd><RiskScore score={details.riskScore} /></dd>
                </div>
                <div className={styles.definitionItem}>
                  <dt>Scheduled</dt>
                  <dd><time dateTime={details.scheduledFor}>{formatDateTime(details.scheduledFor)}</time></dd>
                </div>
              </dl>
            </section>

            {/* Invoices Section */}
            <section className={styles.section} aria-labelledby={`${panelId}-invoices`}>
              <h3 id={`${panelId}-invoices`} className={styles.sectionTitle}>
                Related Invoices ({details.invoices?.length || 0})
              </h3>
              {details.invoices && details.invoices.length > 0 ? (
                <ul className={styles.invoiceList} role="list">
                  {details.invoices.map((invoice) => (
                    <li key={invoice.id} className={styles.invoiceItem}>
                      <span className={styles.invoiceId}>{invoice.invoiceNumber}</span>
                      <span className={styles.invoiceAmount}>
                        {formatCurrency(invoice.amount, details.currency)}
                      </span>
                      <StatusBadge status={invoice.status} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyText}>No invoices found</p>
              )}
            </section>

            {/* Latest Payment Attempt */}
            <section className={styles.section} aria-labelledby={`${panelId}-payment`}>
              <h3 id={`${panelId}-payment`} className={styles.sectionTitle}>Latest Payment Attempt</h3>
              {details.latestPaymentAttempt ? (
                <dl className={styles.definitionList}>
                  <div className={styles.definitionItem}>
                    <dt>Status</dt>
                    <dd>
                      <StatusBadge status={details.latestPaymentAttempt.status} />
                    </dd>
                  </div>
                  <div className={styles.definitionItem}>
                    <dt>Response</dt>
                    <dd>{details.latestPaymentAttempt.gatewayResponse}</dd>
                  </div>
                  {details.latestPaymentAttempt.errorCode && (
                    <div className={styles.definitionItem}>
                      <dt>Error Code</dt>
                      <dd className={styles.errorCode}>{details.latestPaymentAttempt.errorCode}</dd>
                    </div>
                  )}
                  <div className={styles.definitionItem}>
                    <dt>Date</dt>
                    <dd>
                      <time dateTime={details.latestPaymentAttempt.createdAt}>
                        {formatDateTime(details.latestPaymentAttempt.createdAt)}
                      </time>
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className={styles.emptyText}>No payment attempts found</p>
              )}
            </section>

            {/* Fraud Notes */}
            <section className={styles.section} aria-labelledby={`${panelId}-fraud`}>
              <h3 id={`${panelId}-fraud`} className={styles.sectionTitle}>
                Fraud Notes ({details.fraudNotes?.length || 0})
              </h3>
              {details.fraudNotes && details.fraudNotes.length > 0 ? (
                <ul className={styles.fraudList} role="list">
                  {details.fraudNotes.map((note, index) => (
                    <li key={index} className={styles.fraudNote}>
                      {note}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyText}>No fraud signals detected</p>
              )}
            </section>

            {/* Decision Actions */}
            {canTakeAction && (
              <section className={styles.section} aria-labelledby={`${panelId}-actions`}>
                <h3 id={`${panelId}-actions`} className={styles.sectionTitle}>Take Action</h3>
                
                {/* Success Message */}
                {isSuccess && (
                  <div className={styles.successMessage} role="status" aria-live="polite">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22,4 12,14.01 9,11.01" />
                    </svg>
                    <span>Decision submitted successfully!</span>
                  </div>
                )}

                {/* Decision Form */}
                {!isSuccess && (
                  <form onSubmit={handleSubmit} className={styles.decisionForm}>
                    <div className={styles.decisionButtons} role="group" aria-label="Decision options">
                      <button
                        type="button"
                        className={`${styles.decisionButton} ${styles.approve} ${decision === 'approved' ? styles.selected : ''}`}
                        onClick={() => handleDecisionSelect('approved')}
                        aria-pressed={decision === 'approved'}
                        disabled={isSubmitting}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20,6 9,17 4,12" />
                        </svg>
                        Approve
                      </button>
                      <button
                        type="button"
                        className={`${styles.decisionButton} ${styles.hold} ${decision === 'held' ? styles.selected : ''}`}
                        onClick={() => handleDecisionSelect('held')}
                        aria-pressed={decision === 'held'}
                        disabled={isSubmitting}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 6v6l4 2" />
                        </svg>
                        Hold
                      </button>
                      <button
                        type="button"
                        className={`${styles.decisionButton} ${styles.reject} ${decision === 'rejected' ? styles.selected : ''}`}
                        onClick={() => handleDecisionSelect('rejected')}
                        aria-pressed={decision === 'rejected'}
                        disabled={isSubmitting}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>

                    {/* Reason field - required for reject */}
                    {decision && (
                      <div className={styles.reasonField}>
                        <label htmlFor={`${panelId}-reason`} className={styles.reasonLabel}>
                          Reason {decision === 'rejected' && <span className={styles.required}>*</span>}
                        </label>
                        <textarea
                          id={`${panelId}-reason`}
                          className={styles.reasonInput}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder={decision === 'rejected' 
                            ? 'Please provide a reason for rejection (required)' 
                            : 'Optional: Add a note for this decision'
                          }
                          required={decision === 'rejected'}
                          disabled={isSubmitting}
                          rows={3}
                          aria-describedby={decision === 'rejected' ? `${panelId}-reason-hint` : undefined}
                        />
                        {decision === 'rejected' && (
                          <p id={`${panelId}-reason-hint`} className={styles.reasonHint}>
                            A reason is required when rejecting a payout
                          </p>
                        )}
                      </div>
                    )}

                    {/* Error message */}
                    {error && (
                      <div className={styles.errorMessage} role="alert" aria-live="assertive">
                        {error}
                      </div>
                    )}

                    {/* Submit button */}
                    {decision && (
                      <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isSubmitting || (decision === 'rejected' && !reason.trim())}
                      >
                        {isSubmitting ? (
                          <>
                            <span className={styles.submitSpinner} aria-hidden="true" />
                            Submitting...
                          </>
                        ) : (
                          `Confirm ${decision.charAt(0).toUpperCase() + decision.slice(1)}`
                        )}
                      </button>
                    )}
                  </form>
                )}
              </section>
            )}

            {/* Cannot take action message */}
            {!canTakeAction && (
              <div className={styles.cannotActMessage} role="status">
                <p>This payout has already been {payout.status} and cannot be modified.</p>
              </div>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};

export default PayoutDetailPanel;
