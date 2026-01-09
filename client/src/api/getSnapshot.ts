import apiClient from './client';
import type { ApiResponse, FundsSnapshot } from '../types';

export const getSnapshot = async (): Promise<FundsSnapshot> => {
  const response = await apiClient.get<ApiResponse<FundsSnapshot>>('/payouts/snapshot');
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to fetch snapshot');
  }
  
  return response.data.data!;
};

export default getSnapshot;
