
/**
 * Creator - represents a content creator on the platform
 * Indexes: creators(email), creators(status)
 */
export interface Creator {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'suspended' | 'pending_verification';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payout - scheduled payment to a creator
 * Indexes: payouts(status, scheduledFor), payouts(creatorId), payouts(createdAt)
 */
export interface Payout {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  method: 'bank_transfer' | 'paypal' | 'stripe';
  status: PayoutStatus;
  scheduledFor: Date;
  riskScore: number; // 0-100, higher = more risky
  createdAt: Date;
  updatedAt: Date;
}

export type PayoutStatus = 'pending' | 'flagged' | 'approved' | 'paid' | 'rejected' | 'held';

/**
 * PayoutInvoice - invoices associated with a payout
 * Indexes: payout_invoices(payoutId), payout_invoices(status)
 */
export interface PayoutInvoice {
  id: string;
  payoutId: string;
  invoiceNumber: string;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  createdAt: Date;
}

/**
 * Payment - incoming payment from a subscriber
 * Indexes: payments(creatorId), payments(status), payments(createdAt)
 */
export interface Payment {
  id: string;
  creatorId: string;
  subscriberId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * PaymentAttempt - individual attempt to process a payment
 * Indexes: payment_attempts(paymentId), payment_attempts(createdAt)
 */
export interface PaymentAttempt {
  id: string;
  paymentId: string;
  status: 'pending' | 'success' | 'failed';
  gatewayResponse: string;
  errorCode?: string;
  createdAt: Date;
}

/**
 * FraudSignal - fraud indicators detected for transactions
 * Stored separately from payments because:
 * 1. Shared across multiple payouts (same fraud pattern)
 * 2. Different retention policies (fraud data kept longer for analysis)
 * 3. Allows async fraud scoring without blocking payment flow
 * 4. Enables ML model versioning and re-scoring
 * Indexes: fraud_signals(payoutId), fraud_signals(type), fraud_signals(severity)
 */
export interface FraudSignal {
  id: string;
  payoutId: string;
  type: 'velocity' | 'geo_mismatch' | 'pattern_match' | 'amount_anomaly' | 'device_fingerprint';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

/**
 * PayoutDecision - audit trail for payout approval/rejection decisions
 * Indexes: payout_decisions(payoutId), payout_decisions(decidedBy), payout_decisions(createdAt)
 */
export interface PayoutDecision {
  id: string;
  payoutId: string;
  decision: 'approved' | 'rejected' | 'held';
  reason?: string;
  decidedBy: string; // user ID of the operations specialist
  createdAt: Date;
}


export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface PayoutWithDetails extends Payout {
  creator: Creator;
  invoices: PayoutInvoice[];
  latestPaymentAttempt?: PaymentAttempt;
  fraudSignals: FraudSignal[];
  fraudNotes: string[];
}

export interface PayoutListFilters {
  status?: PayoutStatus | 'all';
}

export interface DecisionRequest {
  decision: 'approved' | 'rejected' | 'held';
  reason?: string;
  decidedBy: string;
}


export interface FundsSnapshot {
  totalScheduledToday: number;
  heldAmount: number;
  flaggedAmount: number;
  currency: string;
}
