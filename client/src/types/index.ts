// ============================================
// Shared types mirroring server types
// ============================================

export interface Creator {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'suspended' | 'pending_verification';
  createdAt: string;
  updatedAt: string;
}

export interface Payout {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  method: 'bank_transfer' | 'paypal' | 'stripe';
  status: PayoutStatus;
  scheduledFor: string;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
}

export type PayoutStatus = 'pending' | 'flagged' | 'approved' | 'paid' | 'rejected' | 'held';

export interface PayoutInvoice {
  id: string;
  payoutId: string;
  invoiceNumber: string;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  createdAt: string;
}

export interface PaymentAttempt {
  id: string;
  paymentId: string;
  status: 'pending' | 'success' | 'failed';
  gatewayResponse: string;
  errorCode?: string;
  createdAt: string;
}

export interface FraudSignal {
  id: string;
  payoutId: string;
  type: 'velocity' | 'geo_mismatch' | 'pattern_match' | 'amount_anomaly' | 'device_fingerprint';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface PayoutDecision {
  id: string;
  payoutId: string;
  decision: 'approved' | 'rejected' | 'held';
  reason?: string;
  decidedBy: string;
  createdAt: string;
}

export interface PayoutWithDetails extends Payout {
  creator: Creator;
  invoices: PayoutInvoice[];
  latestPaymentAttempt?: PaymentAttempt;
  fraudSignals: FraudSignal[];
  fraudNotes: string[];
}

export interface FundsSnapshot {
  totalScheduledToday: number;
  heldAmount: number;
  flaggedAmount: number;
  currency: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

export interface DecisionRequest {
  decision: 'approved' | 'rejected' | 'held';
  reason?: string;
  decidedBy: string;
}

export type FilterStatus = 'all' | 'pending' | 'flagged' | 'paid';
