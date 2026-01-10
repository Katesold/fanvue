import request from 'supertest';
import express from 'express';
import payoutsRouter from './payouts';
import { errorHandler } from '../middleware/errorHandler';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/payouts', payoutsRouter);
app.use(errorHandler);

describe('GET /api/payouts', () => {
  it('should return all payouts without filter', async () => {
    const response = await request(app).get('/api/payouts');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should filter payouts by pending status', async () => {
    const response = await request(app).get('/api/payouts?status=pending');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    response.body.data.forEach((payout: { status: string }) => {
      expect(payout.status).toBe('pending');
    });
  });

  it('should filter payouts by flagged status', async () => {
    const response = await request(app).get('/api/payouts?status=flagged');

    expect(response.status).toBe(200);
    response.body.data.forEach((payout: { status: string }) => {
      expect(payout.status).toBe('flagged');
    });
  });

  it('should filter payouts by paid status', async () => {
    const response = await request(app).get('/api/payouts?status=paid');

    expect(response.status).toBe(200);
    response.body.data.forEach((payout: { status: string }) => {
      expect(payout.status).toBe('paid');
    });
  });

  it('should return all payouts when status is "all"', async () => {
    const response = await request(app).get('/api/payouts?status=all');

    expect(response.status).toBe(200);
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
    expect(typeof response.body.data.totalScheduledToday).toBe('number');
    expect(typeof response.body.data.heldAmount).toBe('number');
    expect(typeof response.body.data.flaggedAmount).toBe('number');
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
    expect(Array.isArray(response.body.data.invoices)).toBe(true);
  });

  it('should return 404 for non-existent payout', async () => {
    const response = await request(app).get('/api/payouts/payout-nonexistent');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('PAYOUT_NOT_FOUND');
  });

  it('should include fraud notes for flagged payouts', async () => {
    // payout-002 has fraud signals in seed data
    const response = await request(app).get('/api/payouts/payout-002');

    expect(response.status).toBe(200);
    expect(response.body.data.fraudSignals.length).toBeGreaterThan(0);
    expect(response.body.data.fraudNotes.length).toBeGreaterThan(0);
  });
});
