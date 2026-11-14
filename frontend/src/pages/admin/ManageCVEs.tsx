import React, { useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2, X, ExternalLink, Upload, Search } from 'lucide-react';
import { cveService } from '../../services/cveService';
import { CVEEntry } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

type FormState = {
  cve_id: string;
  title: string;
  product: string;
  vulnerability_type: string;
  cwe: string;
  cvss_version: string;
  cvss_score: string;
  severity: string;
  cna: string;
  published_date: string;
  advisory_url: string;
  cve_url: string;
  description: string;
};

const empty: FormState = {
  cve_id: '',
  title: '',
  product: '',
  vulnerability_type: '',
  cwe: '',
  cvss_version: '3.1',
  cvss_score: '',
  severity: 'Medium',
  cna: '',
  published_date: '',
  advisory_url: '',
  cve_url: '',
  description: '',
};

const SEVERITIES = ['Critical', 'High', 'Medium', 'Low', 'None'];

const ManageCVEs: React.FC = () => {
  const [entries, setEntries] = useState<CVEEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CVEEntry | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      setEntries(await cveService.getAll());
    } catch (e) {
      console.error('Failed to fetch CVEs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const openModal = (entry?: CVEEntry) => {
    if (entry) {
      setEditing(entry);
      setForm({
        cve_id: entry.cve_id || '',
        title: entry.title || '',
        product: entry.product || '',
        vulnerability_type: entry.vulnerability_type || '',
        cwe: entry.cwe || '',
        cvss_version: entry.cvss_version || '',
        cvss_score: entry.cvss_score != null ? String(entry.cvss_score) : '',
        severity: entry.severity || 'Medium',
        cna: entry.cna || '',
        published_date: (entry.published_date || '').split('T')[0],
        advisory_url: entry.advisory_url || '',
        cve_url: entry.cve_url || '',
        description: entry.description || '',
      });
      setImagePreview(entry.image_url || null);
    } else {
      setEditing(null);
      setForm(empty);
      setImagePreview(null);
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    const values = { ...form };
    if (!values.cve_url && values.cve_id) values.cve_url = `https://www.cve.org/CVERecord?id=${values.cve_id.trim()}`;
    Object.entries(values).forEach(([k, v]) => fd.append(k, typeof v === 'string' ? v.trim() : v));
    if (imageFile) fd.append('image', imageFile);
    try {
      setSaving(true);
      if (editing) await cveService.update(editing.id, fd);
      else await cveService.create(fd);
      await fetchEntries();
      closeModal();
    } catch (err: any) {
      alert(err?.message || 'Failed to save CVE');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this CVE?')) return;
    try {
      await cveService.delete(id);
      fetchEntries();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete CVE');
    }
  };

  const handleRemoveImage = async () => {
    if (editing?.image_url && !imageFile) {
      if (!window.confirm('Remove this image?')) return;
      try {
        await cveService.deleteImage(editing.id);
        setEditing({ ...editing, image_url: null });
        await fetchEntries();
      } catch (err: any) {
        alert(err?.message || 'Failed to remove image');
        return;
      }
    }
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const filtered = entries.filter((e) =>
    [e.cve_id, e.title, e.product, e.cna].some((v) => (v || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold text-white">Manage CVEs</h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add CVE
        </Button>
      </div>
      <p className="text-gray-400 mb-6">These appear at the top of the Bug Bounty tab on your site.</p>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input placeholder="Search CVEs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading CVEs...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((entry) => (
            <Card key={entry.id} className="p-6">
              <div className="flex justify-between items-start gap-4">
                {entry.image_url && (
                  <div className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                    <img src={entry.image_url} alt={entry.cve_id} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white">{entry.cve_id}</h3>
                    <Badge variant="warning">{entry.severity}{entry.cvss_score != null ? ` ${entry.cvss_score}` : ''}</Badge>
                    {entry.cwe && <Badge variant="outline">{entry.cwe}</Badge>}
                  </div>
                  <p className="text-gray-300 mb-2">{entry.title}</p>
                  <p className="text-sm text-gray-500">
                    {entry.cna && <>CNA: {entry.cna} · </>}
                    Published {entry.published_date ? new Date(entry.published_date).toLocaleDateString() : '—'}
                  </p>
                  {entry.advisory_url && (
                    <a href={entry.advisory_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm mt-2">
                      Advisory <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="outline" onClick={() => openModal(entry)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => handleDelete(entry.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-gray-400 text-center py-12">No CVEs yet.</p>}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editing ? 'Edit CVE' : 'Add CVE'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="CVE ID *" placeholder="CVE-2026-12345" value={form.cve_id} onChange={set('cve_id')} required />
                <Input label="Published date *" type="date" value={form.published_date} onChange={set('published_date')} required />
              </div>
              <Input label="Title *" placeholder="Product <= 1.2.3 – Vulnerability type" value={form.title} onChange={set('title')} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Product" value={form.product} onChange={set('product')} />
                <Input label="Vulnerability type" placeholder="SQL Injection" value={form.vulnerability_type} onChange={set('vulnerability_type')} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Severity</label>
                  <select value={form.severity} onChange={set('severity')} className="w-full px-4 py-2.5 rounded-lg bg-navy-900/50 border border-navy-700 text-warm-50">
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <Input label="CVSS score" type="number" step="0.1" min="0" max="10" value={form.cvss_score} onChange={set('cvss_score')} />
                <Input label="CVSS version" placeholder="3.1" value={form.cvss_version} onChange={set('cvss_version')} />
                <Input label="CWE" placeholder="CWE-79" value={form.cwe} onChange={set('cwe')} />
              </div>
              <Input label="CNA (who assigned it)" placeholder="Patchstack, MITRE, …" value={form.cna} onChange={set('cna')} />
              <Input label="Advisory URL" type="url" value={form.advisory_url} onChange={set('advisory_url')} />
              <Input label="CVE record URL (filled in automatically if empty)" type="url" value={form.cve_url} onChange={set('cve_url')} />
              <Textarea label="Description" rows={4} value={form.description} onChange={set('description')} />

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Image (optional)</label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg" />
                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-cyan-500 hover:text-cyan-400">
                    <Upload className="w-4 h-4" /> Upload image
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 5 * 1024 * 1024) {
                      alert('Please choose an image under 5 MB.');
                      return;
                    }
                    setImageFile(f);
                    setImagePreview(URL.createObjectURL(f));
                  }}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Update CVE' : 'Add CVE'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCVEs;
