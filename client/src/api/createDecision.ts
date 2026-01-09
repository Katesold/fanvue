import apiClient from './client';
import type { ApiResponse, PayoutDecision, DecisionRequest } from '../types';

export const createDecision = async (
  payoutId: string,
  decision: DecisionRequest
): Promise<PayoutDecision> => {
  const response = await apiClient.post<ApiResponse<PayoutDecision>>(
    `/decisions/${payoutId}`,
    decision
  );
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Failed to create decision');
  }
  
  return response.data.data!;
};

export default createDecision;
