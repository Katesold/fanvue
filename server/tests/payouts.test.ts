import request from 'supertest';
import express from 'express';
import payoutsRouter from '../src/routes/payouts';
import { errorHandler } from '../src/middleware/errorHandler';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/payouts', payoutsRouter);
app.use(errorHandler);

describe('Payouts API', () => {
  describe('GET /api/payouts', () => {
    it('should return all payouts', async () => {
      const response = await request(app).get('/api/payouts');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter payouts by status', async () => {
      const response = await request(app).get('/api/payouts?status=pending');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every((p: { status: string }) => p.status === 'pending')).toBe(true);
    });

    it('should return all payouts when status is "all"', async () => {
      const response = await request(app).get('/api/payouts?status=all');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/payouts/snapshot', () => {
    it('should return funds snapshot', async () => {
      const response = await request(app).get('/api/payouts/snapshot');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalScheduledToday');
      expect(response.body.data).toHaveProperty('heldAmount');
      expect(response.body.data).toHaveProperty('flaggedAmount');
      expect(response.body.data).toHaveProperty('currency');
    });
  });

  describe('GET /api/payouts/:id', () => {
    it('should return payout details with related data', async () => {
      const response = await request(app).get('/api/payouts/payout-001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('payout-001');
      expect(response.body.data).toHaveProperty('creator');
      expect(response.body.data).toHaveProperty('invoices');
      expect(response.body.data).toHaveProperty('fraudSignals');
      expect(response.body.data).toHaveProperty('fraudNotes');
    });

    it('should return 404 for non-existent payout', async () => {
      const response = await request(app).get('/api/payouts/payout-999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PAYOUT_NOT_FOUND');
    });

    it('should include fraud signals for flagged payouts', async () => {
      const response = await request(app).get('/api/payouts/payout-002');

      expect(response.status).toBe(200);
      expect(response.body.data.fraudSignals.length).toBeGreaterThan(0);
      expect(response.body.data.fraudNotes.length).toBeGreaterThan(0);
    });
  });
});
