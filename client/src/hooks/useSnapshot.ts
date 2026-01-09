import { useQuery } from '@tanstack/react-query';
import { getSnapshot } from '../api';

// Query keys
export const snapshotKeys = {
  all: ['snapshot'] as const,
  current: () => [...snapshotKeys.all, 'current'] as const,
};

/**
 * Hook to fetch funds snapshot data
 * Includes total scheduled today, held amount, and flagged amount
 */
export const useSnapshot = () => {
  return useQuery({
    queryKey: snapshotKeys.current(),
    queryFn: getSnapshot,
    staleTime: 30 * 1000, // 30 seconds - snapshot data updates frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Auto-refetch every minute
    refetchOnWindowFocus: true,
    meta: {
      errorMessage: 'Failed to load funds snapshot',
    },
  });
};

export default useSnapshot;
