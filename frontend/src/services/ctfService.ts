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
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ctf`, {
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
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ctf/${id}`, {
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
    return apiClient.delete(`/ctf/${id}`);
  },

  async deleteImage(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/ctf/${id}/image`);
  },
};
