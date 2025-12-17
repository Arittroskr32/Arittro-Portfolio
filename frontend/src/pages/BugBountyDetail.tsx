import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Calendar, Shield, Award, Flag, FileText } from 'lucide-react';
import { bugBountyService } from '../services/bugBountyService';
import { BugBountyEntry } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function BugBountyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<BugBountyEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEntry();
    }
  }, [id]);

  const fetchEntry = async () => {
    try {
      setLoading(true);
      const data = await bugBountyService.getById(id!);
      setEntry(data);
    } catch (error) {
      console.error('Failed to fetch bug bounty entry:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading bug bounty entry...</p>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Bug bounty entry not found</p>
        <button
          onClick={() => navigate('/ctf-bug-bounty')}
          className="mt-4 text-cyan-400 hover:text-cyan-300"
        >
          ← Back to Bug Bounty
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate('/ctf-bug-bounty')}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Bug Bounty
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {entry.vulnerability_type}
            </h1>
            <p className="text-xl text-gray-300">{entry.program_name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={getStatusColor(entry.status) as any}>
              {entry.status}
            </Badge>
            <span
              className={`${getSeverityColor(
                entry.severity
              )} text-white text-sm px-3 py-1 rounded`}
            >
              {entry.severity}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {entry.bounty_amount != null && (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 className="text-sm font-medium text-gray-400">Bounty Amount</h3>
              </div>
              <p className="text-2xl font-bold text-white">
                ${entry.bounty_amount.toLocaleString()}
              </p>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-cyan-500" />
              <h3 className="text-sm font-medium text-gray-400">Report Date</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {new Date(entry.report_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <h3 className="text-sm font-medium text-gray-400">Severity Level</h3>
            </div>
            <p className="text-2xl font-bold text-white">{entry.severity}</p>
          </Card>
        </div>

        {entry.description && (
          <Card className="p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-cyan-500" />
              <h2 className="text-2xl font-bold text-white">Description</h2>
            </div>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {entry.description}
            </p>
          </Card>
        )}

        <Card className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Program Name</h3>
              <p className="text-lg text-white">{entry.program_name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Vulnerability Type
              </h3>
              <p className="text-lg text-white">{entry.vulnerability_type}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Status</h3>
              <p className="text-lg text-white">{entry.status}</p>
            </div>

            {entry.bounty_amount != null && (
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">
                  Bounty Amount
                </h3>
                <p className="text-lg text-white">
                  ${entry.bounty_amount.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {entry.report_url && (
            <div className="mt-8 pt-6 border-t border-gray-700">
              <a
                href={entry.report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition-colors"
              >
                View Full Report <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
