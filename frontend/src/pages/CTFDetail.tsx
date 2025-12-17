import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ctfService } from '../services/ctfService';
import { CTFEntry } from '../types';
import {
  ArrowLeft,
  Calendar,
  Users,
  Trophy,
  Target,
  Award,
  ExternalLink,
  Flag,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export function CTFDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<CTFEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCTFEntry();
  }, [id]);

  const fetchCTFEntry = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await ctfService.getById(parseInt(id));
      setEntry(data);
    } catch (error) {
      console.error('Failed to fetch CTF entry:', error);
      setError('Failed to load CTF entry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading CTF entry...</p>
        </div>
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Flag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">CTF Entry Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The requested CTF entry could not be found.'}</p>
          <Button onClick={() => navigate('/ctf-bug-bounty')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CTF List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/ctf-bug-bounty"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CTF List
        </Link>
      </motion.div>

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            {entry.image_url && (
              <div className="rounded-lg overflow-hidden bg-navy-800">
                <img
                  src={entry.image_url}
                  alt={entry.competition_name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className={entry.image_url ? '' : 'md:col-span-2'}>
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-4xl font-bold text-white">{entry.competition_name}</h1>
                <Badge variant="accent" className="flex items-center gap-2 text-lg px-4 py-2">
                  <Award className="w-5 h-5" />
                  Rank #{entry.rank}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-cyan-500" />
                  <div>
                    <p className="text-sm text-gray-500">Event Date</p>
                    <p className="font-semibold">{new Date(entry.event_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {entry.team_name && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Users className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Team</p>
                      <p className="font-semibold">{entry.team_name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-gray-300">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Challenges</p>
                    <p className="font-semibold">
                      {entry.challenges_solved} / {entry.total_challenges}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                  <Target className="w-5 h-5 text-cyan-500" />
                  <div>
                    <p className="text-sm text-gray-500">Points</p>
                    <p className="font-semibold">{entry.points_earned}</p>
                  </div>
                </div>
              </div>

              {entry.writeup_url && (
                <a
                  href={entry.writeup_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  View Writeup <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Description */}
      {entry.description && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">About This Competition</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{entry.description}</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Performance Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-navy-700/50 rounded-lg p-6 text-center">
              <Award className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">#{entry.rank}</p>
              <p className="text-gray-400">Final Rank</p>
            </div>
            <div className="bg-navy-700/50 rounded-lg p-6 text-center">
              <Trophy className="w-8 h-8 text-cyan-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">
                {Math.round((entry.challenges_solved / entry.total_challenges) * 100)}%
              </p>
              <p className="text-gray-400">Completion Rate</p>
            </div>
            <div className="bg-navy-700/50 rounded-lg p-6 text-center">
              <Target className="w-8 h-8 text-purple-500 mx-auto mb-3" />
              <p className="text-3xl font-bold text-white mb-2">{entry.points_earned}</p>
              <p className="text-gray-400">Total Points</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
