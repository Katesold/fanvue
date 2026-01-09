import { Router } from 'express';
import { createDecision } from '../controllers/decisionsController';

const router = Router();

// POST /api/decisions/:payoutId - Create a decision for a payout
router.post('/:payoutId', createDecision);

export default router;
