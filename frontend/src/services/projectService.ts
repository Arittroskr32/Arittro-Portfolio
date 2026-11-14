import { apiClient } from './api';
import { Project } from '../types';

export const projectService = {
  async getAll(featured?: boolean): Promise<Project[]> {
    const query = featured ? '?featured=true' : '';
    return apiClient.get(`/projects${query}`);
  },

  async getById(id: number): Promise<Project> {
    return apiClient.get(`/projects/${id}`);
  },

  async create(data: FormData | Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: number; message: string }> {
    return apiClient.post('/projects', data);
  },

  async update(id: number, data: FormData | Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<{ message: string }> {
    return apiClient.put(`/projects/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/projects/${id}`);
  },

  async deleteImage(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/projects/${id}/image`);
  },
};
