import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Lock, ExternalLink } from 'lucide-react';
import { GITHUB_REPO } from '../../services/config';

export function AdminLogin() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ token });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Could not sign in');
    } finally {
      setLoading(false);
    }
  };

  const createTokenUrl =
    'https://github.com/settings/personal-access-tokens/new?name=Portfolio%20admin&description=Edit%20portfolio%20content&contents=write&actions=read';

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-electric-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-electric-500" />
          </div>
          <h1 className="text-2xl font-bold text-warm-50">Admin Access</h1>
          <p className="text-slate-400 text-sm mt-2">
            Sign in with a GitHub token that can write to <span className="text-slate-300">{GITHUB_REPO}</span>.
            Your changes are saved as commits and go live after the site redeploys (about a minute).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="GitHub personal access token"
            type="password"
            autoComplete="off"
            placeholder="github_pat_..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            disabled={loading}
          />

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Checking token...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-xs text-slate-400 space-y-2">
          <p>
            Need a token?{' '}
            <a href={createTokenUrl} target="_blank" rel="noopener noreferrer" className="text-electric-500 hover:underline inline-flex items-center gap-1">
              Create a fine-grained token <ExternalLink className="h-3 w-3" />
            </a>
            . Choose <b>Only select repositories</b> → {GITHUB_REPO.split('/')[1]}, and set <b>Contents</b> to Read and write
            (and optionally <b>Actions</b> to Read-only to see deploy status).
          </p>
          <p>The token is stored only in this browser. Sign out on shared computers.</p>
        </div>
      </Card>
    </div>
  );
}
