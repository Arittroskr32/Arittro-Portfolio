import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, X, ExternalLink, Upload, Award } from 'lucide-react';
import { certificateService } from '../../services/certificateService';
import { Certificate } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface CertificateFormData {
  rank: number;
  title: string;
  description: string;
  issuing_organization: string;
  issue_date: string;
  skill_tags: string;
  verification_link: string;
}

const VITE_API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8888/api';
const BACKEND_URL = String(VITE_API_URL).replace(/\/api\/?$/i, '');

const makeFullUrl = (p?: string | null) => {
  if (!p) return undefined;
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return `${BACKEND_URL}${p.startsWith('/') ? p : `/${p}`}`;
};

const ManageCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CertificateFormData>({
    rank: 0,
    title: '',
    description: '',
    issuing_organization: '',
    issue_date: '',
    skill_tags: '',
    verification_link: '',
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getAll();
      setCertificates(data);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('rank', formData.rank.toString());
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('issuing_organization', formData.issuing_organization);
      formDataToSend.append('issue_date', formData.issue_date);
      formDataToSend.append('skill_tags', formData.skill_tags || '');
      formDataToSend.append('verification_link', formData.verification_link || '');
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingCertificate) {
        await certificateService.update(editingCertificate.id, formDataToSend);
      } else {
        await certificateService.create(formDataToSend);
      }
      fetchCertificates();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save certificate:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to save certificate. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this certificate?')) {
      try {
        await certificateService.delete(id);
        fetchCertificates();
      } catch (error) {
        console.error('Failed to delete certificate:', error);
        alert('Failed to delete certificate. Please try again.');
      }
    }
  };

  const openModal = (certificate?: Certificate) => {
    if (certificate) {
      setEditingCertificate(certificate);
      setFormData({
        rank: certificate.rank || 0,
        title: certificate.title,
        description: certificate.description,
        issuing_organization: certificate.issuing_organization,
        issue_date: certificate.issue_date.split('T')[0],
        skill_tags: certificate.skill_tags || '',
        verification_link: certificate.verification_link || '',
      });
      setImagePreview(makeFullUrl(certificate.image_url) || null);
      setImageFile(null);
    } else {
      setEditingCertificate(null);
      setFormData({
        rank: 0,
        title: '',
        description: '',
        issuing_organization: '',
        issue_date: '',
        skill_tags: '',
        verification_link: '',
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCertificate(null);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = async () => {
    if (editingCertificate && editingCertificate.image_url && !imageFile) {
      if (window.confirm('Are you sure you want to delete this image? This cannot be undone.')) {
        try {
          await certificateService.deleteImage(editingCertificate.id);
          setImagePreview(null);
          setImageFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          await fetchCertificates();
          closeModal();
        } catch (error) {
          console.error('Failed to delete image:', error);
          alert('Failed to delete image. Please try again.');
        }
      }
    } else {
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredCertificates = certificates.filter((cert) =>
    cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.issuing_organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Certificates</h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Certificate
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search certificates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading certificates...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCertificates.map((cert) => (
            <Card key={cert.id} className="p-6">
              <div className="flex justify-between items-start gap-4">
                {cert.image_url && (
                  <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                    <img
                      src={makeFullUrl(cert.image_url)}
                      alt={cert.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="h-5 w-5 text-electric-500" />
                    <h3 className="text-xl font-bold text-white">
                      {cert.title}
                    </h3>
                    {cert.rank > 0 && (
                      <Badge variant="accent">Rank {cert.rank}</Badge>
                    )}
                  </div>
                  <p className="text-gray-400 mb-2">{cert.issuing_organization}</p>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Issue Date</p>
                      <p className="text-white font-semibold">
                        {new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    {cert.skill_tags && (
                      <div>
                        <p className="text-sm text-gray-500">Skills</p>
                        <p className="text-white font-semibold">
                          {cert.skill_tags.split(',').length} skill(s)
                        </p>
                      </div>
                    )}
                  </div>
                  {cert.description && (
                    <p className="text-gray-400 mb-3">
                      {cert.description.length > 120
                        ? cert.description.slice(0, 120) + '...'
                        : cert.description}
                    </p>
                  )}
                  {cert.verification_link && (
                    <a
                      href={cert.verification_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                    >
                      Verify Certificate <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    onClick={() => openModal(cert)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(cert.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Issuing Organization *
                </label>
                <Input
                  type="text"
                  value={formData.issuing_organization}
                  onChange={(e) =>
                    setFormData({ ...formData, issuing_organization: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Issue Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) =>
                      setFormData({ ...formData, issue_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Rank (0 = default)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.rank}
                    onChange={(e) =>
                      setFormData({ ...formData, rank: parseInt(e.target.value) || 0 })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">Lower rank appears first</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Markdown supported) *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={6}
                  required
                  placeholder="Supports markdown formatting: **bold**, *italic*, `code`, ## Headings, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Skill Tags (comma-separated)
                </label>
                <Input
                  type="text"
                  value={formData.skill_tags}
                  onChange={(e) =>
                    setFormData({ ...formData, skill_tags: e.target.value })
                  }
                  placeholder="e.g. Python, Web Security, Docker"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Verification Link (optional)
                </label>
                <Input
                  type="url"
                  value={formData.verification_link}
                  onChange={(e) =>
                    setFormData({ ...formData, verification_link: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Certificate Image
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-700">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP (MAX. 5MB)</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCertificate ? 'Update Certificate' : 'Create Certificate'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCertificates;
