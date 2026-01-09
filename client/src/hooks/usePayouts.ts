import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayouts, getPayoutById, createDecision } from '../api';
import type { Payout, PayoutWithDetails, FilterStatus, DecisionRequest } from '../types';
import { announceToScreenReader } from '../utils/accessibility';

// Query keys factory for consistency
export const payoutKeys = {
  all: ['payouts'] as const,
  lists: () => [...payoutKeys.all, 'list'] as const,
  list: (filter: FilterStatus) => [...payoutKeys.lists(), filter] as const,
  details: () => [...payoutKeys.all, 'detail'] as const,
  detail: (id: string) => [...payoutKeys.details(), id] as const,
};

/**
 * Hook to fetch payouts list with filtering
 * @param filter - Filter status ('all' | 'pending' | 'flagged' | 'paid')
 */
export const usePayouts = (filter: FilterStatus = 'all') => {
  return useQuery({
    queryKey: payoutKeys.list(filter),
    queryFn: () => getPayouts(filter),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchOnWindowFocus: true,
    meta: {
      errorMessage: 'Failed to load payouts',
    },
  });
};

/**
 * Hook to fetch single payout details
 * @param id - Payout ID
 * @param enabled - Whether to enable the query
 */
export const usePayoutDetails = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: payoutKeys.detail(id),
    queryFn: () => getPayoutById(id),
    enabled: enabled && !!id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    meta: {
      errorMessage: 'Failed to load payout details',
    },
  });
};

/**
 * Hook for creating payout decisions with optimistic updates
 */
export const useCreateDecision = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutId, decision }: { payoutId: string; decision: DecisionRequest }) =>
      createDecision(payoutId, decision),

    // Optimistic update
    onMutate: async ({ payoutId, decision }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: payoutKeys.all });

      // Snapshot previous values
      const previousPayouts = queryClient.getQueriesData<Payout[]>({
        queryKey: payoutKeys.lists(),
      });
      const previousDetail = queryClient.getQueryData<PayoutWithDetails>(
        payoutKeys.detail(payoutId)
      );

      // Optimistically update payouts lists
      queryClient.setQueriesData<Payout[]>(
        { queryKey: payoutKeys.lists() },
        (old) =>
          old?.map((payout) =>
            payout.id === payoutId
              ? { ...payout, status: decision.decision, updatedAt: new Date().toISOString() }
              : payout
          )
      );

      // Optimistically update detail
      if (previousDetail) {
        queryClient.setQueryData<PayoutWithDetails>(
          payoutKeys.detail(payoutId),
          {
            ...previousDetail,
            status: decision.decision,
            updatedAt: new Date().toISOString(),
          }
        );
      }

      // Announce to screen readers
      announceToScreenReader(`Payout ${decision.decision}`, 'polite');

      return { previousPayouts, previousDetail };
    },

    // Rollback on error
    onError: (_err, { payoutId }, context) => {
      if (context?.previousPayouts) {
        context.previousPayouts.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(payoutKeys.detail(payoutId), context.previousDetail);
      }
      announceToScreenReader('Action failed. Please try again.', 'assertive');
    },

    // Refetch after success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.all });
    },

    onSuccess: (_, { decision }) => {
      announceToScreenReader(`Payout successfully ${decision.decision}`, 'polite');
    },
  });
};

export default usePayouts;
