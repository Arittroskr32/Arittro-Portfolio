import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Flag, Shield, PenTool, Bug } from 'lucide-react';
import { generalService } from '../../services/generalService';

interface Stats {
  ctfs_played: string;
  security_projects: string;
  writeups: string;
  bounties: string;
}

const highlightsConfig = [{
  key: 'ctfs_played' as keyof Stats,
  label: 'CTFs Played',
  icon: Flag,
  color: 'text-green-500',
  bg: 'bg-green-500/10'
}, {
  key: 'security_projects' as keyof Stats,
  label: 'Security Projects',
  icon: Shield,
  color: 'text-electric-500',
  bg: 'bg-electric-500/10'
}, {
  key: 'writeups' as keyof Stats,
  label: 'Blogs',
  icon: PenTool,
  color: 'text-purple-500',
  bg: 'bg-purple-500/10'
}, {
  key: 'bounties' as keyof Stats,
  label: 'Bounties',
  icon: Bug,
  color: 'text-orange-500',
  bg: 'bg-orange-500/10'
}];

export function QuickHighlights() {
  const [stats, setStats] = useState<Stats>({
    ctfs_played: '50+',
    security_projects: '12',
    writeups: '25',
    bounties: 'Active'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await generalService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayValue = (key: keyof Stats, value: string) => {
    if (key === 'ctfs_played' && !value.includes('+')) {
      return value + '+';
    }
    return value;
  };

  return <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      {highlightsConfig.map(item => <Card key={item.label} className="flex flex-col items-center text-center p-4" hover>
          <div className={`p-3 rounded-full ${item.bg} mb-3`}>
            <item.icon className={`h-6 w-6 ${item.color}`} />
          </div>
          <span className="text-2xl font-bold text-warm-50 mb-1">
            {loading ? '...' : getDisplayValue(item.key, stats[item.key])}
          </span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            {item.label}
          </span>
        </Card>)}
    </div>;
}