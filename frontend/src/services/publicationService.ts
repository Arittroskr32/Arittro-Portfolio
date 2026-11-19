import { apiClient } from './api';
import { Publication } from '../types';

export type PublicationInput = Omit<Publication, 'id' | 'created_at' | 'updated_at'>;

export const publicationService = {
  async getAll(): Promise<Publication[]> {
    return apiClient.get('/publications');
  },

  async create(data: PublicationInput): Promise<{ id: number; message: string }> {
    return apiClient.post('/publications', data);
  },

  async update(id: number, data: PublicationInput): Promise<{ message: string }> {
    return apiClient.put(`/publications/${id}`, data);
  },

  async delete(id: number): Promise<{ message: string }> {
    return apiClient.delete(`/publications/${id}`);
  },
};

/** Common types shown first, in this order. Any other type follows alphabetically. */
export const PUBLICATION_TYPES = ['Conference papers', 'Journal papers', 'Workshop papers', 'Preprints', 'Book chapters'];

/** Group papers by type, then by year (newest first). */
export function groupPublications(pubs: Publication[]) {
  const typeOrder = (t: string) => {
    const i = PUBLICATION_TYPES.indexOf(t);
    return i < 0 ? PUBLICATION_TYPES.length : i;
  };
  const types = Array.from(new Set(pubs.map((p) => p.type || 'Other'))).sort(
    (a, b) => typeOrder(a) - typeOrder(b) || a.localeCompare(b)
  );
  return types.map((type) => {
    const inType = pubs.filter((p) => (p.type || 'Other') === type);
    const years = Array.from(new Set(inType.map((p) => Number(p.year) || 0))).sort((a, b) => b - a);
    return {
      type,
      years: years.map((year) => ({ year, papers: inType.filter((p) => (Number(p.year) || 0) === year) })),
    };
  });
}
