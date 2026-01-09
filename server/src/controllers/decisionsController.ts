import type { Request, Response, NextFunction } from 'express';
import { dataStore } from '../data/seedData';
import { AppError } from '../middleware/errorHandler';
import type { ApiResponse, PayoutDecision, DecisionRequest } from '../types';

// Decision validation rules
export const validateDecision = (
  decision: string,
  reason?: string
): { valid: boolean; error?: string } => {
  const validDecisions = ['approved', 'rejected', 'held'];

  if (!validDecisions.includes(decision)) {
    return {
      valid: false,
      error: `Invalid decision. Must be one of: ${validDecisions.join(', ')}`,
    };
  }

  // Reject requires a reason
  if (decision === 'rejected' && (!reason || reason.trim().length === 0)) {
    return {
      valid: false,
      error: 'A reason is required when rejecting a payout',
    };
  }

  return { valid: true };
};

// POST /api/decisions/:payoutId
export const createDecision = (
  req: Request<{ payoutId: string }, unknown, DecisionRequest>,
  res: Response<ApiResponse<PayoutDecision>>,
  next: NextFunction
): void => {
  const { payoutId } = req.params;
  const { decision, reason, decidedBy } = req.body;

  // Find the payout
  const payoutIndex = dataStore.payouts.findIndex((p) => p.id === payoutId);

  if (payoutIndex === -1) {
    return next(
      new AppError(404, 'PAYOUT_NOT_FOUND', `Payout with ID ${payoutId} not found`)
    );
  }

  const payout = dataStore.payouts[payoutIndex];

  // Check if payout can be decided on
  if (payout.status === 'paid') {
    return next(
      new AppError(400, 'PAYOUT_ALREADY_PAID', 'Cannot modify a payout that has already been paid')
    );
  }

  // Validate the decision
  const validation = validateDecision(decision, reason);
  if (!validation.valid) {
    return next(new AppError(400, 'INVALID_DECISION', validation.error!));
  }

  // Validate decidedBy
  if (!decidedBy || decidedBy.trim().length === 0) {
    return next(
      new AppError(400, 'MISSING_DECIDED_BY', 'decidedBy field is required')
    );
  }

  // Create the decision record
  const newDecision: PayoutDecision = {
    id: dataStore.generateId(),
    payoutId,
    decision: decision as 'approved' | 'rejected' | 'held',
    reason: reason?.trim(),
    decidedBy: decidedBy.trim(),
    createdAt: new Date(),
  };

  // Update payout status
  const statusMap: Record<string, 'approved' | 'rejected' | 'held'> = {
    approved: 'approved',
    rejected: 'rejected',
    held: 'held',
  };

  dataStore.payouts[payoutIndex] = {
    ...payout,
    status: statusMap[decision],
    updatedAt: new Date(),
  };

  // Store the decision
  dataStore.payoutDecisions.push(newDecision);

  console.log('[Decision Created]', {
    payoutId,
    decision,
    reason,
    decidedBy,
    previousStatus: payout.status,
    newStatus: statusMap[decision],
  });

  res.status(201).json({
    success: true,
    data: newDecision,
    timestamp: new Date().toISOString(),
  });
};
