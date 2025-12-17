import { apiClient } from './api';
import { Skill } from '../types';

export const skillService = {
  async getAll(category?: string): Promise<Skill[]> {
    const query = category ? `?category=${category}` : '';
    return apiClient.get(`/skills${query}`);
  },

  async getById(id: number): Promise<Skill> {
    return apiClient.get(`/skills/${id}`);
  },

  async create(data: Omit<Skill, 'id' | 'created_at'>): Promise<{ id: number; message: string }> {
    return apiClient.post('/skills', data);
  },

  async update(id: number, data: Partial<Omit<Skill, 'id' | 'created_at'>>): Promise<{ message: string }> {
    return apiClient.put(`/skills/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/skills/${id}`);
  },
};
