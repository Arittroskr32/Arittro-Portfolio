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
    if (data instanceof FormData) {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      const contentType = response.headers.get('content-type') || '';
      let result: any;
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        // If response is HTML (error page) or plain text, throw as error
        throw new Error(text || 'Non-JSON response from server');
      }

      if (!response.ok) {
        throw { response: { data: result } };
      }

      return result;
    }
    return apiClient.post('/projects', data);
  },

  async update(id: number, data: FormData | Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<{ message: string }> {
    if (data instanceof FormData) {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/projects/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: data,
      });

      const contentType = response.headers.get('content-type') || '';
      let result: any;
      if (contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Non-JSON response from server');
      }

      if (!response.ok) {
        throw { response: { data: result } };
      }

      return result;
    }
    return apiClient.put(`/projects/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/projects/${id}`);
  },

  async deleteImage(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/projects/${id}/image`);
  },
};
