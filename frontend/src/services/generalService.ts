import { apiClient } from './api';
import { Stat } from '../types';

export interface ProfileContent {
  hero_title: string;
  hero_subtitle: string;
  hero_tagline: string;
  hero_description: string;
  about_intro: string;
  about_journey: string;
  about_current: string;
  about_philosophy: string;
}

export interface DashboardStats {
  projects: number;
  blogPosts: number;
  ctfEntries: number;
  bugBountyEntries: number;
  skills: number;
  certificates: number;
  unreadMessages: number;
}

export interface JourneyHighlight {
  id: number;
  year: string;
  title: string;
  description: string;
  display_order: number;
  is_featured: number;
  created_at: string;
  updated_at: string;
}

export interface QuickStats {
  ctfs_played: string;
  security_projects: string;
  writeups: string;
  bounties: string;
}

export const generalService = {
  async getHighlights(): Promise<Stat[]> {
    return apiClient.get('/highlights');
  },

  async updateHighlight(id: string, data: Partial<Stat>): Promise<{ message: string }> {
    return apiClient.put(`/highlights/${id}`, data);
  },

  async getProfileContent(): Promise<ProfileContent> {
    return apiClient.get('/profile-content');
  },

  async updateProfileContent(section: string, content: string): Promise<{ message: string }> {
    return apiClient.put('/profile-content', { section, content });
  },

  async getDashboardStats(): Promise<DashboardStats> {
    return apiClient.get('/dashboard/stats');
  },

  // Journey Highlights
  async getJourneyHighlights(): Promise<JourneyHighlight[]> {
    return apiClient.get('/journey-highlights');
  },

  async createJourneyHighlight(data: Partial<JourneyHighlight>): Promise<{ id: number; message: string }> {
    return apiClient.post('/journey-highlights', data);
  },

  async updateJourneyHighlight(id: number, data: Partial<JourneyHighlight>): Promise<{ message: string }> {
    return apiClient.put(`/journey-highlights/${id}`, data);
  },

  async deleteJourneyHighlight(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/journey-highlights/${id}`);
  },

  // Quick Stats
  async getStats(): Promise<QuickStats> {
    return apiClient.get('/stats');
  },

  async updateStats(stats: QuickStats): Promise<{ message: string }> {
    return apiClient.put('/stats', stats);
  },
};
