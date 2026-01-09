import apiClient from './client';
import type { ApiResponse, Payout, FilterStatus } from '../types';

export const getPayouts = async (status?: FilterStatus): Promise<Payout[]> => {
  const params = status && status !== 'all' ? { status } : {};
  const response = await apiClient.get<ApiResponse<Payout[]>>('/payouts', { params });
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch payouts');
  }
  
  return response.data.data!;
};

export default getPayouts;
