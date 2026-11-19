import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, X, ExternalLink, Search } from 'lucide-react';
import { Publication, PublicationLink } from '../../types';
import { PUBLICATION_TYPES, publicationService } from '../../services/publicationService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

type FormState = {
  title: string;
  authors: string;
  venue: string;
  track: string;
  year: string;
  type: string;
  links: PublicationLink[];
};

const empty = (): FormState => ({
  title: '',
  authors: '',
  venue: '',
  track: '',
  year: String(new Date().getFullYear()),
  type: PUBLICATION_TYPES[0],
  links: [{ label: 'Paper', url: '' }],
});

const LINK_SUGGESTIONS = ['Paper', 'arXiv', 'PDF', 'Code', 'Slides', 'Poster', 'Video', 'DOI'];

const ManagePublications: React.FC = () => {
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Publication | null>(null);
  const [form, setForm] = useState<FormState>(empty());

  const fetchPubs = async () => {
    try {
      setLoading(true);
      setPubs(await publicationService.getAll());
    } catch (e) {
      console.error('Failed to fetch publications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPubs();
  }, []);

  const typeOptions = Array.from(new Set([...PUBLICATION_TYPES, ...pubs.map((p) => p.type).filter(Boolean)]));

  const openModal = (p?: Publication) => {
    if (p) {
      setEditing(p);
      setForm({
        title: p.title || '',
        authors: p.authors || '',
        venue: p.venue || '',
        track: p.track || '',
        year: p.year != null ? String(p.year) : '',
        type: p.type || PUBLICATION_TYPES[0],
        links: p.links?.length ? p.links.map((l) => ({ ...l })) : [],
      });
    } else {
      setEditing(null);
      setForm(empty());
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const set = (k: Exclude<keyof FormState, 'links'>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const setLink = (i: number, k: keyof PublicationLink, v: string) =>
    setForm({ ...form, links: form.links.map((l, j) => (j === i ? { ...l, [k]: v } : l)) });
  const addLink = () => {
    const used = new Set(form.links.map((l) => l.label));
    const label = LINK_SUGGESTIONS.find((s) => !used.has(s)) || '';
    setForm({ ...form, links: [...form.links, { label, url: '' }] });
  };
  const removeLink = (i: number) => setForm({ ...form, links: form.links.filter((_, j) => j !== i) });
  const moveLink = (i: number, d: -1 | 1) => {
    const links = [...form.links];
    const j = i + d;
    if (j < 0 || j >= links.length) return;
    [links[i], links[j]] = [links[j], links[i]];
    setForm({ ...form, links });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: form.title.trim(),
      authors: form.authors.trim(),
      venue: form.venue.trim(),
      track: form.track.trim(),
      year: Number(form.year) || new Date().getFullYear(),
      type: form.type.trim() || PUBLICATION_TYPES[0],
      links: form.links
        .map((l) => ({ label: l.label.trim() || 'Link', url: l.url.trim() }))
        .filter((l) => l.url),
    };
    try {
      setSaving(true);
      if (editing) await publicationService.update(editing.id, data);
      else await publicationService.create(data);
      await fetchPubs();
      closeModal();
    } catch (err: any) {
      alert(err?.message || 'Failed to save publication');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this publication?')) return;
    try {
      await publicationService.delete(id);
      fetchPubs();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete publication');
    }
  };

  const q = search.toLowerCase();
  const filtered = pubs.filter((p) =>
    [p.title, p.authors, p.venue, p.track, p.type, String(p.year)].some((v) => (v || '').toLowerCase().includes(q))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-white">Manage Publications</h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Publication
        </Button>
      </div>
      <p className="text-gray-400 mb-6">
        Shown on the Publications page, grouped by type and then by year (newest first).
      </p>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input placeholder="Search publications..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading publications...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="p-6">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge variant="accent">{p.type}</Badge>
                    <Badge variant="outline">{p.year}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-white">{p.title}</h3>
                  {p.authors && <p className="text-gray-400 text-sm mt-1">{p.authors}</p>}
                  <p className="text-sm text-gray-500 mt-1">
                    {[p.venue, p.track].filter(Boolean).join(' · ')}
                  </p>
                  {p.links?.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {p.links.map((l, i) => (
                        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm">
                          {l.label} <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" onClick={() => openModal(p)} aria-label="Edit">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(p.id)} aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-gray-400 text-center py-12">No publications yet.</p>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editing ? 'Edit Publication' : 'Add Publication'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Title *" value={form.title} onChange={set('title')} required />
              <Input label="Authors" placeholder="First Author, Second Author, …" value={form.authors} onChange={set('authors')} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Type *</label>
                  <input
                    list="publication-types"
                    value={form.type}
                    onChange={set('type')}
                    required
                    className="w-full px-4 py-2.5 rounded-lg bg-navy-900/50 border border-navy-700 text-warm-50 focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:border-electric-500"
                  />
                  <datalist id="publication-types">
                    {typeOptions.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                </div>
                <Input label="Year *" type="number" min="1900" max="2100" value={form.year} onChange={set('year')} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Venue" placeholder="ACM SIGIR 2026 (A*)" value={form.venue} onChange={set('venue')} />
                <Input label="Track / note" placeholder="Reproducibility track" value={form.track} onChange={set('track')} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-400">Links (optional)</label>
                  <button type="button" onClick={addLink} className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300">
                    <Plus className="w-4 h-4" /> Add link
                  </button>
                </div>
                <datalist id="publication-link-labels">
                  {LINK_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <div className="space-y-2">
                  {form.links.map((l, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        list="publication-link-labels"
                        placeholder="Label"
                        value={l.label}
                        onChange={(e) => setLink(i, 'label', e.target.value)}
                        className="w-32 px-3 py-2.5 rounded-lg bg-navy-900/50 border border-navy-700 text-warm-50 placeholder-slate-500"
                      />
                      <input
                        type="url"
                        placeholder="https://…"
                        value={l.url}
                        onChange={(e) => setLink(i, 'url', e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-navy-900/50 border border-navy-700 text-warm-50 placeholder-slate-500"
                      />
                      <div className="flex flex-col">
                        <button type="button" onClick={() => moveLink(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-white disabled:opacity-30 text-xs leading-none px-1" aria-label="Move up">▲</button>
                        <button type="button" onClick={() => moveLink(i, 1)} disabled={i === form.links.length - 1} className="text-gray-400 hover:text-white disabled:opacity-30 text-xs leading-none px-1" aria-label="Move down">▼</button>
                      </div>
                      <button type="button" onClick={() => removeLink(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg" aria-label="Remove link">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {form.links.length === 0 && <p className="text-sm text-gray-500">No links. Links with an empty URL are skipped.</p>}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Update Publication' : 'Add Publication'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePublications;
