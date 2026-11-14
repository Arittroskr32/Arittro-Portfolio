import { apiClient } from './api';

export interface ContactMessage {
  id?: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  read_status?: boolean;
  created_at?: string;
}

export interface SiteSettings {
  contact_email?: string;
  /** Optional Formspree / Web3Forms endpoint. Empty = open the visitor's email app. */
  contact_form_endpoint?: string;
  /** Web3Forms needs a public access key sent with each message. */
  contact_form_access_key?: string;
}

export const contactService = {
  async submit(data: Omit<ContactMessage, 'id'>): Promise<{ id: number; message: string; mode?: 'sent' | 'mailto' }> {
    return apiClient.post('/contact', data);
  },

  async getSettings(): Promise<SiteSettings> {
    return apiClient.get('/settings');
  },

  async updateSettings(settings: SiteSettings): Promise<{ message: string }> {
    return apiClient.put('/settings', settings);
  },
};
