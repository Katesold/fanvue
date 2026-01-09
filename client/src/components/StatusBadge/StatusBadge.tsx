import styles from './StatusBadge.module.scss';

// Extended status type to cover payouts, invoices, and payment attempts
type StatusType = 
  | 'pending' 
  | 'flagged' 
  | 'approved' 
  | 'paid' 
  | 'rejected' 
  | 'held'
  | 'processed'  // invoice status
  | 'success'    // payment attempt status
  | 'failed'     // invoice/payment attempt status
  | 'completed'  // payment status
  | 'refunded';  // payment status

interface StatusBadgeProps {
  status: StatusType | string;
}

interface StatusConfig {
  label: string;
  variant: string;
  description: string;
}

// Status configuration with semantic variants
const STATUS_CONFIG: Readonly<Record<string, StatusConfig>> = {
  // Payout statuses
  pending: { label: 'Pending', variant: 'warning', description: 'Awaiting processing' },
  flagged: { label: 'Flagged', variant: 'danger', description: 'Requires review' },
  approved: { label: 'Approved', variant: 'success', description: 'Ready for payment' },
  paid: { label: 'Paid', variant: 'success', description: 'Payment completed' },
  rejected: { label: 'Rejected', variant: 'danger', description: 'Payment denied' },
  held: { label: 'Held', variant: 'warning', description: 'Temporarily paused' },
  // Invoice statuses
  processed: { label: 'Processed', variant: 'success', description: 'Invoice processed' },
  // Payment attempt statuses
  success: { label: 'Success', variant: 'success', description: 'Transaction successful' },
  failed: { label: 'Failed', variant: 'danger', description: 'Transaction failed' },
  // Payment statuses
  completed: { label: 'Completed', variant: 'success', description: 'Payment completed' },
  refunded: { label: 'Refunded', variant: 'warning', description: 'Payment refunded' },
} as const;

// Default config for unknown statuses
const DEFAULT_CONFIG: StatusConfig = {
  label: 'Unknown',
  variant: 'default',
  description: 'Unknown status',
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = STATUS_CONFIG[status] ?? { 
    ...DEFAULT_CONFIG, 
    label: String(status).charAt(0).toUpperCase() + String(status).slice(1),
  };
  
  return (
    <span 
      className={`${styles.badge} ${styles[config.variant] ?? styles.default}`}
      role="status"
      title={config.description}
    >
      <span className={styles.indicator} aria-hidden="true" />
      <span className={styles.text}>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
