import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit, Trash2, X } from 'lucide-react';
import { generalService, JourneyHighlight, QuickStats } from '../../services/generalService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';

interface ProfileContent {
  section: string;
  content: string;
}

const ProfileEditor: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [aboutContent, setAboutContent] = useState('');
  
  // Journey Highlights state
  const [journeyHighlights, setJourneyHighlights] = useState<JourneyHighlight[]>([]);
  const [showJourneyModal, setShowJourneyModal] = useState(false);
  const [editingJourney, setEditingJourney] = useState<JourneyHighlight | null>(null);
  const [journeyForm, setJourneyForm] = useState({
    year: '',
    title: '',
    description: '',
    is_featured: false
  });

  // Quick Stats state
  const [stats, setStats] = useState<QuickStats>({
    ctfs_played: '',
    security_projects: '',
    writeups: '',
    bounties: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchJourneyHighlights();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await generalService.getProfileContent();
      
      setHeroTitle(data.hero_title || '');
      setHeroSubtitle(data.hero_subtitle || '');
      setHeroDescription(data.hero_description || '');
      setAboutContent(data.about_intro || '');
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJourneyHighlights = async () => {
    try {
      const data = await generalService.getJourneyHighlights();
      setJourneyHighlights(data);
    } catch (error) {
      console.error('Failed to fetch journey highlights:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await generalService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSave = async (section: string, content: string) => {
    try {
      setSaving(true);
      await generalService.updateProfileContent(section, content);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      
      await Promise.all([
        generalService.updateProfileContent('hero_title', heroTitle),
        generalService.updateProfileContent('hero_subtitle', heroSubtitle),
        generalService.updateProfileContent('hero_description', heroDescription),
        generalService.updateProfileContent('about', aboutContent),
      ]);
      
      alert('All changes saved successfully!');
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Journey Highlights functions
  const openJourneyModal = (journey?: JourneyHighlight) => {
    if (journey) {
      setEditingJourney(journey);
      setJourneyForm({
        year: journey.year,
        title: journey.title,
        description: journey.description,
        is_featured: journey.is_featured === 1
      });
    } else {
      setEditingJourney(null);
      setJourneyForm({
        year: '',
        title: '',
        description: '',
        is_featured: false
      });
    }
    setShowJourneyModal(true);
  };

  const closeJourneyModal = () => {
    setShowJourneyModal(false);
    setEditingJourney(null);
  };

  const handleJourneySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingJourney) {
        await generalService.updateJourneyHighlight(editingJourney.id, {
          ...journeyForm,
          is_featured: journeyForm.is_featured ? 1 : 0
        } as any);
      } else {
        await generalService.createJourneyHighlight({
          ...journeyForm,
          is_featured: journeyForm.is_featured ? 1 : 0,
          display_order: journeyHighlights.length + 1
        } as any);
      }
      await fetchJourneyHighlights();
      closeJourneyModal();
      alert('Journey highlight saved successfully!');
    } catch (error) {
      console.error('Failed to save journey highlight:', error);
      alert('Failed to save journey highlight. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteJourney = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this journey highlight?')) {
      try {
        await generalService.deleteJourneyHighlight(id);
        await fetchJourneyHighlights();
        alert('Journey highlight deleted successfully!');
      } catch (error) {
        console.error('Failed to delete journey highlight:', error);
        alert('Failed to delete journey highlight. Please try again.');
      }
    }
  };

  const handleSaveStats = async () => {
    try {
      setSaving(true);
      await generalService.updateStats(stats);
      alert('Stats updated successfully!');
    } catch (error) {
      console.error('Failed to update stats:', error);
      alert('Failed to update stats. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Profile Editor</h1>
        <Button onClick={handleSaveAll} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      <div className="space-y-6">
        {/* Hero Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Main Title
              </label>
              <Input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="e.g., Hi, I'm Arittro Sarkar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Subtitle/Role
              </label>
              <Input
                type="text"
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="e.g., Cybersecurity Specialist & Full-Stack Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <Textarea
                value={heroDescription}
                onChange={(e) => setHeroDescription(e.target.value)}
                rows={4}
                placeholder="Brief introduction about yourself..."
              />
            </div>

            <Button
              variant="outline"
              onClick={() => handleSave('hero_title', heroTitle)}
              disabled={saving}
            >
              Save Hero Section
            </Button>
          </div>
        </Card>

        {/* About Section */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">About Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                About Content (Supports Markdown)
              </label>
              <Textarea
                value={aboutContent}
                onChange={(e) => setAboutContent(e.target.value)}
                rows={12}
                placeholder="Write your detailed about section here..."
              />
              <p className="text-xs text-gray-500 mt-2">
                You can use Markdown formatting for better text styling
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => handleSave('about', aboutContent)}
              disabled={saving}
            >
              Save About Section
            </Button>
          </div>
        </Card>

        {/* Journey Highlights Section */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Journey Highlights</h2>
            <Button onClick={() => openJourneyModal()} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Journey
            </Button>
          </div>

          <div className="space-y-3">
            {journeyHighlights.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No journey highlights yet. Add your first milestone!</p>
            ) : (
              journeyHighlights.map((journey) => (
                <div key={journey.id} className="border border-gray-700 rounded-lg p-4 flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-cyan-400">{journey.year}</span>
                      {journey.is_featured === 1 && (
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">Featured</span>
                      )}
                    </div>
                    <h3 className="font-bold text-white mb-1">{journey.title}</h3>
                    <p className="text-sm text-gray-400">{journey.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => openJourneyModal(journey)}
                      className="text-cyan-400 hover:text-cyan-300 p-2"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteJourney(journey.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Quick Stats Section */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Quick Stats</h2>
            <Button onClick={handleSaveStats} size="sm" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              Save Stats
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                CTFs Played
              </label>
              <Input
                type="text"
                value={stats.ctfs_played}
                onChange={(e) => setStats({ ...stats, ctfs_played: e.target.value })}
                placeholder="e.g., 50+"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Security Projects
              </label>
              <Input
                type="text"
                value={stats.security_projects}
                onChange={(e) => setStats({ ...stats, security_projects: e.target.value })}
                placeholder="e.g., 12"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Writeups
              </label>
              <Input
                type="text"
                value={stats.writeups}
                onChange={(e) => setStats({ ...stats, writeups: e.target.value })}
                placeholder="e.g., 25"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bounties
              </label>
              <Input
                type="text"
                value={stats.bounties}
                onChange={(e) => setStats({ ...stats, bounties: e.target.value })}
                placeholder="e.g., Active"
              />
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-3">
            These stats are displayed on the home page as quick highlights.
          </p>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 bg-cyan-500/10 border-cyan-500/20">
          <h3 className="text-lg font-bold text-white mb-3">Quick Tips</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Use Markdown formatting for rich text in the About section</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Keep your hero title concise and attention-grabbing</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Update your subtitle to reflect your current role or expertise</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-400">•</span>
              <span>Preview your changes on the public site to see how they look</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Journey Modal */}
      {showJourneyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingJourney ? 'Edit Journey Highlight' : 'Add Journey Highlight'}
              </h2>
              <button
                onClick={closeJourneyModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJourneySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Year *
                </label>
                <Input
                  type="text"
                  value={journeyForm.year}
                  onChange={(e) => setJourneyForm({ ...journeyForm, year: e.target.value })}
                  placeholder="e.g., 2023"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <Input
                  type="text"
                  value={journeyForm.title}
                  onChange={(e) => setJourneyForm({ ...journeyForm, title: e.target.value })}
                  placeholder="e.g., Started Bug Bounty Hunting"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <Textarea
                  value={journeyForm.description}
                  onChange={(e) => setJourneyForm({ ...journeyForm, description: e.target.value })}
                  rows={3}
                  placeholder="Brief description of this milestone..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={journeyForm.is_featured}
                  onChange={(e) => setJourneyForm({ ...journeyForm, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-cyan-500 focus:ring-cyan-500"
                />
                <label htmlFor="is_featured" className="text-sm text-gray-300">
                  Mark as featured (highlighted in electric blue)
                </label>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeJourneyModal}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingJourney ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProfileEditor;
