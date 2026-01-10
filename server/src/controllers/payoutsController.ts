import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../data/seedData';
import { AppError } from '../middleware/errorHandler';
import { 
  filterBy, 
  sortByDate, 
  sumBy, 
  pipe, 
  startOfDay, 
  endOfDay, 
  isWithinRange 
} from '../utils';
import type {
  ApiResponse,
  Payout,
  PayoutWithDetails,
  FundsSnapshot,
  PayoutStatus,
} from '../types';

// ============================================
// Pure helper functions (no side effects)
// ============================================

const byStatus = (status: PayoutStatus) => 
  filterBy<Payout>((p) => p.status === status);

const byScheduledDate = sortByDate<Payout>((p) => p.scheduledFor);

const byScheduledToday = filterBy<Payout>((p) => 
  isWithinRange(p.scheduledFor, startOfDay(), endOfDay())
);

const sumAmount = sumBy<Payout>((p) => p.amount);

const createApiResponse = <T>(data: T): ApiResponse<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

// ============================================
// Route handlers
// ============================================

// GET /api/payouts
export const getPayouts = (
  req: Request,
  res: Response<ApiResponse<Payout[]>>,
): void => {
  const { status } = req.query;
  const statusFilter = status as PayoutStatus | 'all' | undefined;

  // Functional pipeline for filtering and sorting
  const processPayouts = pipe<Payout[]>(
    // Apply status filter if provided
    statusFilter && statusFilter !== 'all' 
      ? byStatus(statusFilter) 
      : (payouts) => payouts,
    // Sort by scheduled date descending
    byScheduledDate
  );

  const filteredPayouts = processPayouts([...dataStore.payouts]);

  console.log('[Payouts List]', {
    filter: statusFilter || 'all',
    count: filteredPayouts.length,
  });

  res.json(createApiResponse(filteredPayouts));
};

// GET /api/payouts/snapshot
export const getFundsSnapshot = (
  _req: Request,
  res: Response<ApiResponse<FundsSnapshot>>,
): void => {
  // Get today's payouts using functional approach
  const todayPayouts = byScheduledToday([...dataStore.payouts]);

  // Calculate amounts using pure functions
  const snapshot: FundsSnapshot = {
    totalScheduledToday: sumAmount(todayPayouts),
    heldAmount: pipe<Payout[], Payout[], number>(
      byStatus('held'),
      sumAmount
    )(todayPayouts),
    flaggedAmount: pipe<Payout[], Payout[], number>(
      byStatus('flagged'),
      sumAmount
    )(todayPayouts),
    currency: 'USD',
  };

  console.log('[Funds Snapshot]', snapshot);

  res.json(createApiResponse(snapshot));
};

// GET /api/payouts/:id
export const getPayoutById = (
  req: Request,
  res: Response<ApiResponse<PayoutWithDetails>>,
  next: NextFunction
): void => {
  const { id } = req.params;

  const payout = dataStore.payouts.find((p) => p.id === id);

  if (!payout) {
    return next(new AppError(404, 'PAYOUT_NOT_FOUND', `Payout with ID ${id} not found`));
  }

  const creator = dataStore.creators.find((c) => c.id === payout.creatorId);
  const invoices = dataStore.payoutInvoices.filter((i) => i.payoutId === id);
  const fraudSignals = dataStore.fraudSignals.filter((f) => f.payoutId === id);

  // Get latest payment attempt for the creator
  const creatorPayments = dataStore.payments.filter((p) => p.creatorId === payout.creatorId);
  const paymentIds = creatorPayments.map((p) => p.id);
  const attempts = dataStore.paymentAttempts
    .filter((a) => paymentIds.includes(a.paymentId))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Build fraud notes from signals
  const fraudNotes = fraudSignals.map(
    (signal) => `[${signal.severity.toUpperCase()}] ${signal.type}: ${signal.description}`
  );

  const payoutWithDetails: PayoutWithDetails = {
    ...payout,
    creator: creator!,
    invoices,
    latestPaymentAttempt: attempts[0],
    fraudSignals,
    fraudNotes,
  };

  console.log('[Payout Details]', {
    payoutId: id,
    creator: creator?.displayName,
    invoicesCount: invoices.length,
    fraudSignalsCount: fraudSignals.length,
  });

  res.json({
    success: true,
    data: payoutWithDetails,
    timestamp: new Date().toISOString(),
  });
};
