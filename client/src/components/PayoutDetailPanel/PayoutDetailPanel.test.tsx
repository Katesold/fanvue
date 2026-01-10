import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PayoutDetailPanel from './PayoutDetailPanel';
import type { Payout } from '../../types';

// Mock API
vi.mock('../../api', () => ({
  getPayoutById: vi.fn(() => Promise.resolve({
    id: 'payout-001',
    creatorId: 'creator-001',
    amount: 2500,
    currency: 'USD',
    method: 'bank_transfer',
    status: 'flagged',
    scheduledFor: '2024-06-15T10:00:00Z',
    riskScore: 72,
    createdAt: '2024-06-14T10:00:00Z',
    updatedAt: '2024-06-14T10:00:00Z',
    creator: {
      id: 'creator-001',
      displayName: 'Alice Johnson',
      email: 'alice@example.com',
      status: 'active',
    },
    invoices: [
      { id: 'inv-001', invoiceNumber: 'INV-001', amount: 1500, status: 'processed' },
      { id: 'inv-002', invoiceNumber: 'INV-002', amount: 1000, status: 'pending' },
    ],
    latestPaymentAttempt: {
      id: 'attempt-001',
      status: 'success',
      gatewayResponse: 'Transaction approved',
      createdAt: '2024-06-14T10:00:00Z',
    },
    fraudSignals: [
      {
        id: 'fraud-001',
        type: 'velocity',
        severity: 'medium',
        description: 'Unusual spike in earnings',
      },
    ],
    fraudNotes: ['Unusual spike in earnings over the last 48 hours'],
  })),
  createDecision: vi.fn(() => Promise.resolve({
    id: 'decision-001',
    payoutId: 'payout-001',
    decision: 'approved',
    decidedBy: 'ops-user-001',
    createdAt: '2024-06-15T10:00:00Z',
  })),
}));

const mockPayout: Payout = {
  id: 'payout-001',
  creatorId: 'creator-001',
  amount: 2500,
  currency: 'USD',
  method: 'bank_transfer',
  status: 'flagged',
  scheduledFor: '2024-06-15T10:00:00Z',
  riskScore: 72,
  createdAt: '2024-06-14T10:00:00Z',
  updatedAt: '2024-06-14T10:00:00Z',
};

// Create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('PayoutDetailPanel', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the panel with payout details', async () => {
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Payout Details')).toBeInTheDocument();
    });

    it('eventually shows payout details after loading', async () => {
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      // Since mock resolves immediately, we should see details
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('displays creator information after loading', async () => {
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('displays related invoices', async () => {
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // Wait for content to load - check for creator name first
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      });

      // Then check for invoices
      expect(screen.getByText(/Related Invoices/)).toBeInTheDocument();
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('INV-002')).toBeInTheDocument();
    });

    it('displays latest payment attempt', async () => {
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByText('Latest Payment Attempt')).toBeInTheDocument();
        expect(screen.getByText('Transaction approved')).toBeInTheDocument();
      });
    });

    it('displays fraud notes', async () => {
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        // The header includes count, e.g., "Fraud Notes (1)"
        expect(screen.getByText(/Fraud Notes/)).toBeInTheDocument();
        expect(screen.getByText(/Unusual spike in earnings/)).toBeInTheDocument();
      });
    });
  });

  describe('decision buttons', () => {
    it('renders approve, hold, and reject buttons', async () => {
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Hold/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
      });
    });

    it('shows reason textarea when reject is selected', async () => {
      const user = userEvent.setup();
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
      });

      const rejectButton = screen.getByRole('button', { name: /Reject/i });
      await user.click(rejectButton);

      // The label is just "Reason" with a required asterisk for rejection
      expect(screen.getByRole('textbox', { name: /Reason/i })).toBeInTheDocument();
    });

    it('submit button is disabled when reject is selected without reason', async () => {
      const user = userEvent.setup();
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Reject/i }));

      const submitButton = screen.getByRole('button', { name: /Confirm Rejected/i });
      expect(submitButton).toBeDisabled();
    });

    it('enables submit button when reject reason is provided', async () => {
      const user = userEvent.setup();
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Reject/i }));
      await user.type(screen.getByRole('textbox'), 'Fraud detected');

      const submitButton = screen.getByRole('button', { name: /Confirm Rejected/i });
      expect(submitButton).toBeEnabled();
    });
  });

  describe('close functionality', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      const closeButton = screen.getByRole('button', { name: /Close/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed', async () => {
      const user = userEvent.setup();
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('has dialog role', async () => {
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has accessible name', async () => {
      render(
        <PayoutDetailPanel payout={mockPayout} onClose={mockOnClose} />,
        { wrapper: createWrapper() }
      );

      expect(screen.getByRole('dialog')).toHaveAccessibleName(/Payout Details/);
    });
  });
});
