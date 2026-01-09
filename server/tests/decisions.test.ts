import request from 'supertest';
import express from 'express';
import decisionsRouter from '../src/routes/decisions';
import payoutsRouter from '../src/routes/payouts';
import { errorHandler } from '../src/middleware/errorHandler';
import { dataStore } from '../src/data/seedData';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/payouts', payoutsRouter);
app.use('/api/decisions', decisionsRouter);
app.use(errorHandler);

describe('Decisions API', () => {
  // Reset data before each test
  beforeEach(() => {
    // Reset payout statuses to original
    dataStore.payouts[0].status = 'pending';
    dataStore.payouts[1].status = 'flagged';
    dataStore.payouts[2].status = 'paid';
  });

  describe('POST /api/decisions/:payoutId', () => {
    it('should approve a pending payout', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-001')
        .send({
          decision: 'approved',
          reason: 'Verified creator with good history',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.decision).toBe('approved');
      expect(response.body.data.payoutId).toBe('payout-001');
    });

    it('should require reason when rejecting', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-001')
        .send({
          decision: 'rejected',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_DECISION');
    });

    it('should reject with valid reason', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-002')
        .send({
          decision: 'rejected',
          reason: 'Confirmed fraudulent activity',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.decision).toBe('rejected');
      expect(response.body.data.reason).toBe('Confirmed fraudulent activity');
    });

    it('should hold a flagged payout', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-002')
        .send({
          decision: 'held',
          reason: 'Awaiting additional verification',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.decision).toBe('held');
    });

    it('should return 404 for non-existent payout', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-999')
        .send({
          decision: 'approved',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PAYOUT_NOT_FOUND');
    });

    it('should not allow decisions on paid payouts', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-003')
        .send({
          decision: 'rejected',
          reason: 'Testing rejection',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PAYOUT_ALREADY_PAID');
    });

    it('should require decidedBy field', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-001')
        .send({
          decision: 'approved',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_DECIDED_BY');
    });

    it('should reject invalid decision values', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-001')
        .send({
          decision: 'invalid_decision',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_DECISION');
    });
  });
});

describe('Decision Validation Rules', () => {
  const { validateDecision } = require('../src/controllers/decisionsController');

  it('should validate approved decision', () => {
    const result = validateDecision('approved');
    expect(result.valid).toBe(true);
  });

  it('should validate held decision', () => {
    const result = validateDecision('held');
    expect(result.valid).toBe(true);
  });

  it('should require reason for rejected', () => {
    const result = validateDecision('rejected');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('reason is required');
  });

  it('should accept rejected with reason', () => {
    const result = validateDecision('rejected', 'Valid reason');
    expect(result.valid).toBe(true);
  });

  it('should reject invalid decision type', () => {
    const result = validateDecision('canceled');
    expect(result.valid).toBe(false);
  });
});
