import request from 'supertest';
import express from 'express';
import decisionsRouter from './decisions';
import { errorHandler } from '../middleware/errorHandler';
import { dataStore } from '../data/seedData';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/decisions', decisionsRouter);
app.use(errorHandler);

describe('POST /api/decisions/:payoutId', () => {
  // Store original payouts to restore after tests
  let originalPayouts: typeof dataStore.payouts;

  beforeEach(() => {
    // Save original state
    originalPayouts = [...dataStore.payouts];
  });

  afterEach(() => {
    // Restore original state
    dataStore.payouts = originalPayouts;
  });

  describe('successful decisions', () => {
    it('should approve a pending payout', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-001')
        .send({
          decision: 'approved',
          reason: 'Verified creator',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.decision).toBe('approved');
      expect(response.body.data.payoutId).toBe('payout-001');

      // Check payout status was updated
      const payout = dataStore.payouts.find((p) => p.id === 'payout-001');
      expect(payout?.status).toBe('approved');
    });

    it('should hold a flagged payout', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-002')
        .send({
          decision: 'held',
          reason: 'Needs further review',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.decision).toBe('held');

      const payout = dataStore.payouts.find((p) => p.id === 'payout-002');
      expect(payout?.status).toBe('held');
    });

    it('should reject a payout with reason', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-002')
        .send({
          decision: 'rejected',
          reason: 'Fraud detected - suspicious activity',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.decision).toBe('rejected');
      expect(response.body.data.reason).toBe('Fraud detected - suspicious activity');

      const payout = dataStore.payouts.find((p) => p.id === 'payout-002');
      expect(payout?.status).toBe('rejected');
    });
  });

  describe('validation errors', () => {
    it('should return 404 for non-existent payout', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-nonexistent')
        .send({
          decision: 'approved',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PAYOUT_NOT_FOUND');
    });

    it('should return 400 when rejecting without reason', async () => {
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

    it('should return 400 for invalid decision type', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-001')
        .send({
          decision: 'invalid-type',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_DECISION');
    });

    it('should return 400 when decidedBy is missing', async () => {
      const response = await request(app)
        .post('/api/decisions/payout-001')
        .send({
          decision: 'approved',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('MISSING_DECIDED_BY');
    });

    it('should return 400 when trying to modify paid payout', async () => {
      // payout-003 is already paid in seed data
      const response = await request(app)
        .post('/api/decisions/payout-003')
        .send({
          decision: 'approved',
          decidedBy: 'ops-user-test',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('PAYOUT_ALREADY_PAID');
    });
  });
});
