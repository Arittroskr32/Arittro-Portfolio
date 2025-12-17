import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, ExternalLink } from 'lucide-react';
import { bugBountyService } from '../../services/bugBountyService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface BugBountyEntry {
  id: number;
  program_name: string;
  vulnerability_type: string;
  severity: string;
  bounty_amount: number;
  report_date: string;
  status: string;
  description?: string;
  report_url?: string;
  created_at: string;
}

interface BugBountyFormData {
  program_name: string;
  vulnerability_type: string;
  severity: string;
  bounty_amount: number | null;
  report_date: string;
  status: string;
  description: string;
  report_url: string;
}

const severities = ['Critical', 'High', 'Medium', 'Low', 'Info'];
const statuses = ['Pending', 'Triaged', 'Resolved', 'Rewarded', 'Rejected'];

const ManageBugBounty: React.FC = () => {
  const [entries, setEntries] = useState<BugBountyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<BugBountyEntry | null>(null);
  const [formData, setFormData] = useState<BugBountyFormData>({
    program_name: '',
    vulnerability_type: '',
    severity: 'Medium',
    bounty_amount: null,
    report_date: '',
    status: 'Pending',
    description: '',
    report_url: '',
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await bugBountyService.getAll();
      setEntries(data);
    } catch (error) {
      console.error('Failed to fetch bug bounty entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting bug bounty entry:', formData);
    try {
      if (editingEntry) {
        await bugBountyService.update(editingEntry.id, formData);
        alert('Bug bounty entry updated successfully!');
      } else {
        await bugBountyService.create(formData);
        alert('Bug bounty entry created successfully!');
      }
      await fetchEntries();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save bug bounty entry:', error);
      alert(`Failed to save bug bounty entry: ${error.message || 'Please try again.'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this bug bounty entry?')) {
      try {
        await bugBountyService.delete(id);
        fetchEntries();
      } catch (error) {
        console.error('Failed to delete bug bounty entry:', error);
        alert('Failed to delete bug bounty entry. Please try again.');
      }
    }
  };

  const openModal = (entry?: BugBountyEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData({
        program_name: entry.program_name,
        vulnerability_type: entry.vulnerability_type,
        severity: entry.severity,
        bounty_amount: entry.bounty_amount,
        report_date: entry.report_date.split('T')[0],
        status: entry.status,
        description: entry.description || '',
        report_url: entry.report_url || '',
      });
    } else {
      setEditingEntry(null);
      setFormData({
        program_name: '',
        vulnerability_type: '',
        severity: 'Medium',
        bounty_amount: null,
        report_date: '',
        status: 'Pending',
        description: '',
        report_url: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEntry(null);
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      Critical: 'bg-red-500',
      High: 'bg-orange-500',
      Medium: 'bg-yellow-500',
      Low: 'bg-blue-500',
      Info: 'bg-gray-500',
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'secondary',
      Triaged: 'outline',
      Resolved: 'primary',
      Rewarded: 'primary',
      Rejected: 'secondary',
    };
    return colors[status] || 'secondary';
  };

  const filteredEntries = entries.filter((entry) =>
    entry.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.vulnerability_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Bug Bounty</h1>
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
            placeholder="Search bug bounty entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading bug bounty entries...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {entry.program_name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(entry.status) as any}>
                        {entry.status}
                      </Badge>
                      <span
                        className={`${getSeverityColor(
                          entry.severity
                        )} text-white text-xs px-2 py-1 rounded`}
                      >
                        {entry.severity}
                      </span>
                    </div>
                  </div>
                  <p className="text-cyan-400 font-semibold mb-2">
                    {entry.vulnerability_type}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {entry.bounty_amount != null && (
                      <div>
                        <p className="text-sm text-gray-500">Bounty Amount</p>
                        <p className="text-white font-semibold">
                          ${entry.bounty_amount.toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Report Date</p>
                      <p className="text-white font-semibold">
                        {new Date(entry.report_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {entry.description && (
                    <p className="text-gray-400 mb-3 line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                  {entry.report_url && (
                    <a
                      href={entry.report_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                    >
                      View Report <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(entry)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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
                {editingEntry ? 'Edit Bug Bounty Entry' : 'Add New Bug Bounty Entry'}
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
                  Program Name *
                </label>
                <Input
                  type="text"
                  value={formData.program_name}
                  onChange={(e) =>
                    setFormData({ ...formData, program_name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vulnerability Type *
                </label>
                <Input
                  type="text"
                  value={formData.vulnerability_type}
                  onChange={(e) =>
                    setFormData({ ...formData, vulnerability_type: e.target.value })
                  }
                  placeholder="e.g., SQL Injection, XSS, CSRF"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Severity *
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) =>
                      setFormData({ ...formData, severity: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    {severities.map((severity) => (
                      <option key={severity} value={severity}>
                        {severity}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bounty Amount ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.bounty_amount ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bounty_amount: e.target.value ? parseFloat(e.target.value) : null,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Report Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.report_date}
                    onChange={(e) =>
                      setFormData({ ...formData, report_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Report URL
                </label>
                <Input
                  type="url"
                  value={formData.report_url}
                  onChange={(e) =>
                    setFormData({ ...formData, report_url: e.target.value })
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
                  placeholder="Brief description of the vulnerability and its impact"
                />
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

export default ManageBugBounty;
