import { apiClient } from './api';
import { CVEEntry } from '../types';

export const cveService = {
  async getAll(): Promise<CVEEntry[]> {
    return apiClient.get('/cves');
  },

  async getById(id: number | string): Promise<CVEEntry> {
    return apiClient.get(`/cves/${id}`);
  },

  async create(data: FormData): Promise<{ id: number; message: string }> {
    return apiClient.postFormData('/cves', data);
  },

  async update(id: number, data: FormData): Promise<{ message: string }> {
    return apiClient.putFormData(`/cves/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/cves/${id}`);
  },

  async deleteImage(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/cves/${id}/image`);
  },
};
