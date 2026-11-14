import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ctfService } from '../services/ctfService';
import { bugBountyService } from '../services/bugBountyService';
import { cveService } from '../services/cveService';
import { CTFEntry, BugBountyEntry, CVEEntry } from '../types';
import { Flag, Bug, Trophy, Target, ExternalLink, Calendar, Award, Users, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function CTFBugBounty() {
  const [activeTab, setActiveTab] = useState<'ctf' | 'bounty'>('ctf');
  const [ctfEntries, setCtfEntries] = useState<CTFEntry[]>([]);
  const [bugBountyEntries, setBugBountyEntries] = useState<BugBountyEntry[]>([]);
  const [cves, setCves] = useState<CVEEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'ctf') {
      fetchCTFEntries();
    } else {
      fetchBugBountyEntries();
    }
  }, [activeTab]);

  const fetchCTFEntries = async () => {
    try {
      setLoading(true);
      const data = await ctfService.getAll();
      setCtfEntries(data);
    } catch (error) {
      console.error('Failed to fetch CTF entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBugBountyEntries = async () => {
    try {
      setLoading(true);
      const [data, cveData] = await Promise.all([
        bugBountyService.getAll(),
        cveService.getAll().catch(() => [] as CVEEntry[]),
      ]);
      setBugBountyEntries(data);
      setCves(cveData);
    } catch (error) {
      console.error('Failed to fetch bug bounty entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCTFClick = (id: number) => {
    navigate(`/ctf/${id}`);
  };

  const handleBugBountyClick = (id: number) => {
    navigate(`/bug-bounty/${id}`);
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

  return (
    <div className="space-y-8">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-4xl font-bold text-warm-50 mb-4">
          CTF & Bug Bounty
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          My competitive security journey, writeups, and bug hunting
          achievements.
        </p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex border-b border-navy-800">
        <button onClick={() => setActiveTab('ctf')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ctf' ? 'border-electric-500 text-electric-500' : 'border-transparent text-slate-400 hover:text-white'}`}>
          <Flag className="h-4 w-4" /> CTF Competitions
        </button>
        <button onClick={() => setActiveTab('bounty')} className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'bounty' ? 'border-electric-500 text-electric-500' : 'border-transparent text-slate-400 hover:text-white'}`}>
          <Bug className="h-4 w-4" /> Bug Bounty
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'ctf' ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading CTF entries...</p>
              </div>
            ) : (
              <>
                <div className="grid gap-6">
                  {ctfEntries.map((entry) => (
                    <Card
                      key={entry.id}
                      className="p-6 cursor-pointer hover:bg-navy-700/50 transition-all group"
                      onClick={() => handleCTFClick(entry.id)}
                    >
                      <div className="flex gap-6">
                        {entry.image_url && (
                          <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-navy-800">
                            <img
                              src={entry.image_url}
                              alt={entry.competition_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                                {entry.competition_name}
                              </h3>
                              <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(entry.event_date).toLocaleDateString()}
                                </div>
                                {entry.team_name && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {entry.team_name}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Badge variant="accent" className="flex items-center gap-1">
                              <Award className="w-4 h-4" />
                              Rank #{entry.rank}
                            </Badge>
                          </div>

                          {entry.description && (
                            <p className="text-gray-400 mb-3 line-clamp-2">
                              {entry.description}
                            </p>
                          )}

                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-300">
                              <Trophy className="w-4 h-4 text-yellow-500" />
                              <span>
                                {entry.challenges_solved}/{entry.total_challenges} challenges
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-300">
                              <Target className="w-4 h-4 text-cyan-500" />
                              <span>{entry.points_earned} points</span>
                            </div>
                            {entry.writeup_url && (
                              <a
                                href={entry.writeup_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 ml-auto"
                              >
                                Writeup <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {ctfEntries.length === 0 && (
                  <div className="text-center py-12">
                    <Flag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No CTF entries found</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading bug bounty entries...</p>
              </div>
            ) : (
              <>
                {cves.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-6 h-6 text-red-400" />
                      <h2 className="text-2xl font-bold text-white">CVEs</h2>
                      <Badge variant="accent">{cves.length}</Badge>
                    </div>
                    <p className="text-slate-400 text-sm">
                      Vulnerabilities I found and responsibly disclosed that were assigned CVE IDs.
                    </p>
                    <div className="grid gap-6">
                      {cves.map((cve) => {
                        const recordUrl = cve.cve_url || `https://www.cve.org/CVERecord?id=${cve.cve_id}`;
                        return (
                          <Card key={cve.id} className="p-6 group">
                            <div className="flex flex-col sm:flex-row gap-6">
                              {cve.image_url && (
                                <a
                                  href={recordUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="sm:w-56 flex-shrink-0 rounded-lg overflow-hidden bg-navy-800 block"
                                >
                                  <img
                                    src={cve.image_url}
                                    alt={cve.cve_id}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                </a>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                  <a
                                    href={recordUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xl font-bold text-white hover:text-cyan-400 transition-colors font-mono"
                                  >
                                    {cve.cve_id}
                                  </a>
                                  <span className={`${getSeverityColor(cve.severity)} text-white text-xs px-2 py-1 rounded`}>
                                    {cve.cvss_score != null ? `${Number(cve.cvss_score).toFixed(1)} ` : ''}
                                    {cve.severity}
                                  </span>
                                </div>
                                <p className="text-gray-300 font-medium mb-3">{cve.title}</p>
                                {cve.description && <p className="text-gray-400 mb-3 line-clamp-3">{cve.description}</p>}
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {cve.cvss_version && <Badge variant="outline">CVSS {cve.cvss_version}</Badge>}
                                  {cve.cwe && <Badge variant="outline">{cve.cwe}{cve.vulnerability_type ? ` · ${cve.vulnerability_type}` : ''}</Badge>}
                                  {cve.cna && <Badge variant="outline">CNA: {cve.cna}</Badge>}
                                </div>
                                <div className="flex flex-wrap items-center gap-6 text-sm">
                                  <div className="flex items-center gap-2 text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    Published {new Date(cve.published_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                                  </div>
                                  {cve.advisory_url && (
                                    <a
                                      href={cve.advisory_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                                    >
                                      Advisory <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
                                  <a
                                    href={recordUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                                  >
                                    CVE record <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </section>
                )}

                {bugBountyEntries.length > 0 && cves.length > 0 && (
                  <div className="flex items-center gap-3 pt-4">
                    <Bug className="w-6 h-6 text-cyan-400" />
                    <h2 className="text-2xl font-bold text-white">Bug Bounty Reports</h2>
                  </div>
                )}
                <div className="grid gap-6">
                  {bugBountyEntries.map((entry) => (
                    <Card
                      key={entry.id}
                      className="p-6 cursor-pointer hover:bg-navy-700/50 transition-all group"
                      onClick={() => handleBugBountyClick(entry.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                              {entry.vulnerability_type}
                            </h3>
                            <span
                              className={`${getSeverityColor(
                                entry.severity
                              )} text-white text-xs px-2 py-1 rounded`}
                            >
                              {entry.severity}
                            </span>
                          </div>
                          <p className="text-gray-300 font-medium mb-3">
                            {entry.program_name}
                          </p>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2 text-gray-400">
                              <Calendar className="w-4 h-4" />
                              {new Date(entry.report_date).toLocaleDateString()}
                            </div>
                            {entry.bounty_amount != null && (
                              <div className="flex items-center gap-2 text-green-400">
                                <Award className="w-4 h-4" />
                                ${entry.bounty_amount.toLocaleString()}
                              </div>
                            )}
                            <Badge variant="outline" className="ml-auto">
                              {entry.status}
                            </Badge>
                          </div>
                          {entry.description && (
                            <p className="text-gray-400 mt-3 line-clamp-2">
                              {entry.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {bugBountyEntries.length === 0 && cves.length === 0 && (
                  <div className="text-center py-12">
                    <Bug className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No bug bounty entries found</p>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}