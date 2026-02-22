import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Folder, FileText, Shield, Bug, Mail, Code, Award } from 'lucide-react';
import { generalService, DashboardStats } from '../../services/generalService';

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      label: 'Unread Messages',
      value: stats?.unreadMessages || 0,
      icon: Mail,
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
              onClick={() => window.location.href = '/admin/blog'}
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
              onClick={() => window.location.href = '/admin/projects'}
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
              onClick={() => window.location.href = '/admin/certificate'}
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
              onClick={() => window.location.href = '/admin/ctf'}
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
            System Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-navy-800">
              <span className="text-sm text-slate-300">Database</span>
              <span className="flex items-center gap-2 text-green-500 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-navy-800">
              <span className="text-sm text-slate-300">API Server</span>
              <span className="flex items-center gap-2 text-green-500 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-slate-300">Last Backup</span>
              <span className="text-slate-400 text-sm">Never</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}