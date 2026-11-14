import { apiClient } from './api';
import { CTFEntry } from '../types';

export const ctfService = {
  async getAll(): Promise<CTFEntry[]> {
    return apiClient.get('/ctf');
  },

  async getById(id: number): Promise<CTFEntry> {
    return apiClient.get(`/ctf/${id}`);
  },

  async create(data: FormData): Promise<{ id: number; message: string }> {
    return apiClient.postFormData('/ctf', data);
  },

  async update(id: number, data: FormData): Promise<{ message: string }> {
    return apiClient.putFormData(`/ctf/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/ctf/${id}`);
  },

  async deleteImage(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/ctf/${id}/image`);
  },
};
