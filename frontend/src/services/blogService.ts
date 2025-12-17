import { apiClient } from './api';

export interface BlogPost {
  id: number;
  title: string;
  category: string;
  tags: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const blogService = {
  async getAll(): Promise<BlogPost[]> {
    return apiClient.get('/blog-posts');
  },

  async getById(id: number | string): Promise<BlogPost> {
    return apiClient.get(`/blog-posts/${id}`);
  },

  async create(formData: FormData): Promise<{ id: number; message: string }> {
    return apiClient.postFormData('/blog-posts', formData);
  },

  async update(id: number | string, formData: FormData): Promise<{ message: string }> {
    return apiClient.putFormData(`/blog-posts/${id}`, formData);
  },

  async delete(id: number | string): Promise<{ message: string }> {
    return apiClient.delete(`/blog-posts/${id}`);
  },
};
