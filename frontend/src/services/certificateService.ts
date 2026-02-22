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
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'}/certificates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });

    const result = await response.json();

    if (!response.ok) {
      throw { response: { data: result } };
    }

    return result;
  },

  async update(id: number, data: FormData): Promise<{ message: string }> {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${(import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api'}/certificates/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: data,
    });

    const result = await response.json();

    if (!response.ok) {
      throw { response: { data: result } };
    }

    return result;
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/certificates/${id}`);
  },

  async deleteImage(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/certificates/${id}/image`);
  },
};
