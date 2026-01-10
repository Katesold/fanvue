import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import FundsConsole from './FundsConsole';

// Mock the API calls
vi.mock('../../api', () => ({
  getSnapshot: vi.fn(() => Promise.resolve({
    totalScheduledToday: 10000,
    heldAmount: 2000,
    flaggedAmount: 3000,
    currency: 'USD',
  })),
  getPayouts: vi.fn(() => Promise.resolve([
    {
      id: 'payout-001',
      creatorId: 'creator-001',
      amount: 2500,
      currency: 'USD',
      method: 'bank_transfer',
      status: 'pending',
      scheduledFor: '2024-06-15T10:00:00Z',
      riskScore: 15,
      createdAt: '2024-06-14T10:00:00Z',
      updatedAt: '2024-06-14T10:00:00Z',
    },
    {
      id: 'payout-002',
      creatorId: 'creator-002',
      amount: 1500,
      currency: 'USD',
      method: 'paypal',
      status: 'flagged',
      scheduledFor: '2024-06-15T10:00:00Z',
      riskScore: 75,
      createdAt: '2024-06-14T10:00:00Z',
      updatedAt: '2024-06-14T10:00:00Z',
    },
  ])),
  getPayoutById: vi.fn(),
  createDecision: vi.fn(),
}));

// Create a wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('FundsConsole', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders the dashboard title', async () => {
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Funds Console Dashboard');
    });

    it('renders stat cards section', async () => {
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('Total Scheduled Today')).toBeInTheDocument();
        expect(screen.getByText('Held Amount')).toBeInTheDocument();
        expect(screen.getByText('Flagged Amount')).toBeInTheDocument();
      });
    });

    it('renders filter pill group', async () => {
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('radiogroup', { name: 'Filter options' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Pending' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Flagged' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Paid' })).toBeInTheDocument();
    });

    it('renders payouts table', async () => {
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });
    });
  });

  describe('filter functionality', () => {
    it('defaults to All filter', async () => {
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      const allFilter = screen.getByRole('radio', { name: 'All' });
      expect(allFilter).toBeChecked();
    });

    it('changes filter when clicked', async () => {
      const user = userEvent.setup();
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      const flaggedFilter = screen.getByRole('radio', { name: 'Flagged' });
      await user.click(flaggedFilter);
      
      expect(flaggedFilter).toBeChecked();
    });

    it('persists filter in localStorage', async () => {
      const user = userEvent.setup();
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      const pendingFilter = screen.getByRole('radio', { name: 'Pending' });
      await user.click(pendingFilter);
      
      expect(localStorage.getItem('fundsConsoleFilter')).toBe('"pending"');
    });
  });

  describe('data display', () => {
    it('displays snapshot values after loading', async () => {
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('$10,000.00')).toBeInTheDocument();
        expect(screen.getByText('$2,000.00')).toBeInTheDocument();
        expect(screen.getByText('$3,000.00')).toBeInTheDocument();
      });
    });

    it('displays payout data in table', async () => {
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByText('$2,500.00')).toBeInTheDocument();
        expect(screen.getByText('$1,500.00')).toBeInTheDocument();
      });
    });
  });

  describe('accessibility', () => {
    it('has proper heading hierarchy', async () => {
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: "Today's Financial Summary" })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Payouts' })).toBeInTheDocument();
    });

    it('has proper landmark regions', async () => {
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      expect(screen.getByRole('region', { name: 'Financial Summary' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Payout Filters' })).toBeInTheDocument();
      expect(screen.getByRole('region', { name: 'Payouts List' })).toBeInTheDocument();
    });

    it('table has accessible caption', async () => {
      render(<FundsConsole />, { wrapper: createWrapper() });
      
      await waitFor(() => {
        expect(screen.getByRole('table')).toHaveAccessibleName(/Payouts/);
      });
    });
  });
});
