import { Router } from 'express';
import {
  getPayouts,
  getPayoutById,
  getFundsSnapshot,
} from '../controllers/payoutsController';

const router = Router();

// GET /api/payouts - List all payouts with optional status filter
router.get('/', getPayouts);

// GET /api/payouts/snapshot - Get funds snapshot summary
router.get('/snapshot', getFundsSnapshot);

// GET /api/payouts/:id - Get payout details with related data
router.get('/:id', getPayoutById);

export default router;
