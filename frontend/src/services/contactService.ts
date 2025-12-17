import { apiClient } from './api';

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  message: string;
  read_status?: boolean;
  created_at?: string;
}

export const contactService = {
  async submit(data: Omit<ContactMessage, 'id'>): Promise<{ id: number; message: string }> {
    return apiClient.post('/contact', data);
  },

  async getAll(unreadOnly?: boolean): Promise<ContactMessage[]> {
    const query = unreadOnly ? '?unreadOnly=true' : '';
    return apiClient.get(`/contact${query}`);
  },

  async markAsRead(id: string): Promise<{ message: string }> {
    return apiClient.patch(`/contact/${id}/read`);
  },

  async delete(id: string): Promise<{ message: string }> {
    return apiClient.delete(`/contact/${id}`);
  },
};
