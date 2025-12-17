import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, X, ExternalLink, Upload, Image as ImageIcon } from 'lucide-react';
import { ctfService } from '../../services/ctfService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface CTFEntry {
  id: number;
  competition_name: string;
  event_date: string;
  rank: number;
  team_name?: string;
  challenges_solved: number;
  total_challenges: number;
  points_earned: number;
  writeup_url?: string;
  description?: string;
  created_at: string;
}

interface CTFFormData {
  competition_name: string;
  event_date: string;
  rank: number;
  team_name: string;
  challenges_solved: number;
  total_challenges: number;
  points_earned: number;
  writeup_url: string;
  description: string;
}

const ManageCTF: React.FC = () => {
  const [entries, setEntries] = useState<CTFEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CTFEntry | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<CTFFormData>({
    competition_name: '',
    event_date: '',
    rank: 1,
    team_name: '',
    challenges_solved: 0,
    total_challenges: 0,
    points_earned: 0,
    writeup_url: '',
    description: '',
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await ctfService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch CTF entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('competition_name', formData.competition_name);
      formDataToSend.append('event_date', formData.event_date);
      formDataToSend.append('rank', formData.rank.toString());
      formDataToSend.append('team_name', formData.team_name || '');
      formDataToSend.append('challenges_solved', formData.challenges_solved.toString());
      formDataToSend.append('total_challenges', formData.total_challenges.toString());
      formDataToSend.append('points_earned', formData.points_earned.toString());
      formDataToSend.append('writeup_url', formData.writeup_url || '');
      formDataToSend.append('description', formData.description || '');
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingEntry) {
        await ctfService.update(editingEntry.id, formDataToSend);
      } else {
        await ctfService.create(formDataToSend);
      }
      fetchEntries();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save CTF entry:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to save CTF entry. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this CTF entry?')) {
      try {
        await ctfService.delete(id);
        fetchEntries();
      } catch (error) {
        console.error('Failed to delete CTF entry:', error);
        alert('Failed to delete CTF entry. Please try again.');
      }
    }
  };

  const openModal = (entry?: CTFEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        competition_name: entry.competition_name,
        event_date: entry.event_date.split('T')[0],
        rank: entry.rank,
        team_name: entry.team_name || '',
        challenges_solved: entry.challenges_solved,
        total_challenges: entry.total_challenges,
        points_earned: entry.points_earned,
        writeup_url: entry.writeup_url || '',
        description: entry.description || '',
      });
      setImagePreview(entry.image_url || null);
      setImageFile(null);
    } else {
      setEditingEntry(null);
      setFormData({
        competition_name: '',
        event_date: '',
        rank: 1,
        team_name: '',
        challenges_solved: 0,
        total_challenges: 0,
        points_earned: 0,
        writeup_url: '',
        description: '',
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEntry(null);
    setImageFile(null);
    setImagePreview(null);
    // Reset file input
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
    // If editing an existing entry with an image, delete it from server
    if (editingEntry && editingEntry.image_url && !imageFile) {
      if (window.confirm('Are you sure you want to delete this image? This cannot be undone.')) {
        try {
          await ctfService.deleteImage(editingEntry.id);
          setImagePreview(null);
          setImageFile(null);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          // Refresh the entries list and close modal
          await fetchEntries();
          closeModal();
        } catch (error) {
          console.error('Failed to delete image:', error);
          alert('Failed to delete image. Please try again.');
        }
      }
    } else {
      // Just clear the preview for newly uploaded images
      setImageFile(null);
      setImagePreview(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredEntries = entries.filter((entry) =>
    entry.competition_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (entry.team_name && entry.team_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage CTF Entries</h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Entry
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search CTF entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading CTF entries...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-6">
              <div className="flex justify-between items-start gap-4">
                {entry.image_url && (
                  <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                    <img
                      src={entry.image_url}
                      alt={entry.competition_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {entry.competition_name}
                    </h3>
                    <Badge variant="primary">Rank #{entry.rank}</Badge>
                  </div>
                  {entry.team_name && (
                    <p className="text-gray-400 mb-2">Team: {entry.team_name}</p>
                  )}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Challenges</p>
                      <p className="text-white font-semibold">
                        {entry.challenges_solved}/{entry.total_challenges}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Points</p>
                      <p className="text-white font-semibold">{entry.points_earned}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="text-white font-semibold">
                        {new Date(entry.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {entry.description && (
                    <p className="text-gray-400 mb-3">{entry.description}</p>
                  )}
                  {entry.writeup_url && (
                    <a
                      href={entry.writeup_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                    >
                      View Writeup <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    onClick={() => openModal(entry)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(entry.id)}
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
                {editingEntry ? 'Edit CTF Entry' : 'Add New CTF Entry'}
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
                  Competition Name *
                </label>
                <Input
                  type="text"
                  value={formData.competition_name}
                  onChange={(e) =>
                    setFormData({ ...formData, competition_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Event Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) =>
                      setFormData({ ...formData, event_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rank *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.rank}
                    onChange={(e) =>
                      setFormData({ ...formData, rank: parseInt(e.target.value) })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Team Name
                </label>
                <Input
                  type="text"
                  value={formData.team_name}
                  onChange={(e) =>
                    setFormData({ ...formData, team_name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Challenges Solved *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.challenges_solved}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        challenges_solved: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Challenges *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.total_challenges}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        total_challenges: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Points Earned *
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={formData.points_earned}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        points_earned: parseInt(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Writeup URL
                </label>
                <Input
                  type="url"
                  value={formData.writeup_url}
                  onChange={(e) =>
                    setFormData({ ...formData, writeup_url: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Competition Image
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
                  {editingEntry ? 'Update Entry' : 'Create Entry'}
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

export default ManageCTF;
