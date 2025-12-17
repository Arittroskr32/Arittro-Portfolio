import { apiClient } from './api';
import { BugBountyEntry } from '../types';

export const bugBountyService = {
  async getAll(params?: { platform?: string; status?: string; severity?: string }): Promise<BugBountyEntry[]> {
    const queryParams = new URLSearchParams();
    if (params?.platform) queryParams.append('platform', params.platform);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.severity) queryParams.append('severity', params.severity);
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return apiClient.get(`/bug-bounty${query}`);
  },

  async getById(id: number | string): Promise<BugBountyEntry> {
    return apiClient.get(`/bug-bounty/${id}`);
  },

  async create(data: Omit<BugBountyEntry, 'id' | 'created_at'>): Promise<{ id: number; message: string }> {
    return apiClient.post('/bug-bounty', data);
  },

  async update(id: number | string, data: Partial<BugBountyEntry>): Promise<{ message: string }> {
    return apiClient.put(`/bug-bounty/${id}`, data);
  },

  async delete(id: number | string): Promise<{ message: string }> {
    return apiClient.delete(`/bug-bounty/${id}`);
  },
};
