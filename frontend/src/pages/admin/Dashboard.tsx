import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Folder, FileText, Shield, Bug, Code, Award, ShieldAlert, BookOpen } from 'lucide-react';
import { getLatestDeploy, DeployStatus } from '../../services/github';
import { lastCommitAt } from '../../services/staticBackend';
import { GITHUB_BRANCH, GITHUB_REPO } from '../../services/config';
import { generalService, DashboardStats } from '../../services/generalService';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deploy, setDeploy] = useState<DeployStatus | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      const d = await getLatestDeploy();
      setDeploy(d);
      if (d.status === 'queued' || d.status === 'in_progress') timer = setTimeout(poll, 10000);
    };
    poll();
    const onCommit = () => { clearTimeout(timer); setTimeout(poll, 5000); };
    window.addEventListener('admin:committed', onCommit);
    return () => { clearTimeout(timer); window.removeEventListener('admin:committed', onCommit); };
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await generalService.getDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
        {error}
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Total Projects',
      value: stats?.projects || 0,
      icon: Folder,
      color: 'text-blue-500'
    },
    {
      label: 'Publications',
      value: (stats as any)?.publications || 0,
      icon: BookOpen,
      color: 'text-teal-500'
    },
    {
      label: 'Blog Posts',
      value: stats?.blogPosts || 0,
      icon: FileText,
      color: 'text-green-500'
    },
    {
      label: 'CTF Entries',
      value: stats?.ctfEntries || 0,
      icon: Shield,
      color: 'text-purple-500'
    },
    {
      label: 'Bug Bounties',
      value: stats?.bugBountyEntries || 0,
      icon: Bug,
      color: 'text-orange-500'
    },
    {
      label: 'Skills',
      value: stats?.skills || 0,
      icon: Code,
      color: 'text-electric-500'
    },
    {
      label: 'Certificates',
      value: stats?.certificates || 0,
      icon: Award,
      color: 'text-yellow-500'
    },
    {
      label: 'CVEs',
      value: (stats as any)?.cves || 0,
      icon: ShieldAlert,
      color: 'text-red-500'
    }
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-warm-50">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-warm-50 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-navy-900 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-bold text-warm-50 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/admin/blog')}
              className="p-4 rounded-lg bg-navy-800 hover:bg-navy-700 transition-colors text-left border border-navy-700"
            >
              <span className="block font-bold text-warm-50 mb-1">
                + New Post
              </span>
              <span className="text-xs text-slate-400">
                Write a new blog article
              </span>
            </button>
            <button 
              onClick={() => navigate('/admin/projects')}
              className="p-4 rounded-lg bg-navy-800 hover:bg-navy-700 transition-colors text-left border border-navy-700"
            >
              <span className="block font-bold text-warm-50 mb-1">
                + Add Project
              </span>
              <span className="text-xs text-slate-400">
                Showcase a new tool
              </span>
            </button>
            <button 
              onClick={() => navigate('/admin/certificate')}
              className="p-4 rounded-lg bg-navy-800 hover:bg-navy-700 transition-colors text-left border border-navy-700"
            >
              <span className="block font-bold text-warm-50 mb-1">
                + Add Certificate
              </span>
              <span className="text-xs text-slate-400">
                Add a new certification
              </span>
            </button>
            <button 
              onClick={() => navigate('/admin/ctf')}
              className="p-4 rounded-lg bg-navy-800 hover:bg-navy-700 transition-colors text-left border border-navy-700"
            >
              <span className="block font-bold text-warm-50 mb-1">
                + CTF Entry
              </span>
              <span className="text-xs text-slate-400">
                Log a competition result
              </span>
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-warm-50 mb-4">
            Publishing
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-navy-800">
              <span className="text-sm text-slate-300">Content saved to</span>
              <a className="text-sm text-electric-500 hover:underline" href={`https://github.com/${GITHUB_REPO}/tree/${GITHUB_BRANCH}/frontend/public/data`} target="_blank" rel="noopener noreferrer">
                {GITHUB_REPO}
              </a>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-navy-800">
              <span className="text-sm text-slate-300">Latest deploy</span>
              {(() => {
                if (!deploy || deploy.status === 'unknown') return <span className="text-slate-400 text-sm">Unknown</span>;
                const running = deploy.status !== 'completed';
                const ok = deploy.conclusion === 'success';
                const color = running ? 'text-yellow-500' : ok ? 'text-green-500' : 'text-red-500';
                const dot = running ? 'bg-yellow-500 animate-pulse' : ok ? 'bg-green-500' : 'bg-red-500';
                const text = running ? 'Deploying…' : ok ? 'Live' : `Failed (${deploy.conclusion})`;
                return (
                  <a href={deploy.html_url || '#'} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-sm ${color}`}>
                    <div className={`w-2 h-2 rounded-full ${dot}`} />
                    {text}
                  </a>
                );
              })()}
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-300">Last change from admin</span>
              <span className="text-slate-400 text-sm">{lastCommitAt() ? new Date(lastCommitAt()!).toLocaleString() : 'None yet'}</span>
            </div>
            <p className="text-xs text-slate-500">
              Each save is a commit. Visitors see it after the deploy finishes, usually within one or two minutes.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}