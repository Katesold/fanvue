import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  describe('payout statuses', () => {
    it('renders pending status correctly', () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('title', 'Awaiting processing');
    });

    it('renders flagged status correctly', () => {
      render(<StatusBadge status="flagged" />);
      expect(screen.getByText('Flagged')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('title', 'Requires review');
    });

    it('renders approved status correctly', () => {
      render(<StatusBadge status="approved" />);
      expect(screen.getByText('Approved')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('title', 'Ready for payment');
    });

    it('renders paid status correctly', () => {
      render(<StatusBadge status="paid" />);
      expect(screen.getByText('Paid')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('title', 'Payment completed');
    });

    it('renders rejected status correctly', () => {
      render(<StatusBadge status="rejected" />);
      expect(screen.getByText('Rejected')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('title', 'Payment denied');
    });

    it('renders held status correctly', () => {
      render(<StatusBadge status="held" />);
      expect(screen.getByText('Held')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('title', 'Temporarily paused');
    });
  });

  describe('invoice/payment statuses', () => {
    it('renders processed status correctly', () => {
      render(<StatusBadge status="processed" />);
      expect(screen.getByText('Processed')).toBeInTheDocument();
    });

    it('renders success status correctly', () => {
      render(<StatusBadge status="success" />);
      expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('renders failed status correctly', () => {
      render(<StatusBadge status="failed" />);
      expect(screen.getByText('Failed')).toBeInTheDocument();
    });
  });

  describe('unknown statuses', () => {
    it('handles unknown status with fallback', () => {
      render(<StatusBadge status="custom-status" />);
      // Should capitalize the first letter
      expect(screen.getByText('Custom-status')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has status role', () => {
      render(<StatusBadge status="pending" />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has title attribute for description', () => {
      render(<StatusBadge status="flagged" />);
      expect(screen.getByRole('status')).toHaveAttribute('title');
    });
  });
});
