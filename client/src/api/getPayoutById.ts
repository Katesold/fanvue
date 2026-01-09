import apiClient from './client';
import type { ApiResponse, PayoutWithDetails } from '../types';

export const getPayoutById = async (id: string): Promise<PayoutWithDetails> => {
  const response = await apiClient.get<ApiResponse<PayoutWithDetails>>(`/payouts/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch payout details');
  }
  
  return response.data.data!;
};

export default getPayoutById;
