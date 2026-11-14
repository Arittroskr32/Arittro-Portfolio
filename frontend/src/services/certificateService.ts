import { apiClient } from './api';
import { Certificate } from '../types';

export const certificateService = {
  async getAll(): Promise<Certificate[]> {
    return apiClient.get('/certificates');
  },

  async getById(id: number): Promise<Certificate> {
    return apiClient.get(`/certificates/${id}`);
  },

  async create(data: FormData): Promise<{ id: number; message: string }> {
    return apiClient.postFormData('/certificates', data);
  },

  async update(id: number, data: FormData): Promise<{ message: string }> {
    return apiClient.putFormData(`/certificates/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/certificates/${id}`);
  },

  async deleteImage(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/certificates/${id}/image`);
  },
};
