import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { certificateService } from '../services/certificateService';
import { Certificate } from '../types';
import { Card } from '../components/ui/Card';
import { Award, Calendar, ExternalLink, Building2 } from 'lucide-react';

const VITE_API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8888/api';
const BACKEND_URL = String(VITE_API_URL).replace(/\/api\/?$/i, '');

const makeFullUrl = (p?: string | null) => {
  if (!p) return undefined;
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return `${BACKEND_URL}${p.startsWith('/') ? p : `/${p}`}`;
};

export function Certificates() {
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const data = await certificateService.getAll();
      setCertificates(data);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-warm-50 mb-4">Certificates</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Professional certifications and achievements in cybersecurity, development, and related technologies.
        </p>
      </motion.div>

      {/* Certificates Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert, index) => (
          <motion.div
            layout
            key={cert.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <Card
              className="flex flex-col h-full group cursor-pointer overflow-hidden"
              hover
              onClick={() => navigate(`/certificate/${cert.id}`)}
            >
              {/* Certificate Image */}
              {cert.image_url && (
                <div className="relative w-full h-48 bg-navy-900 rounded-lg overflow-hidden mb-4">
                  <img
                    src={makeFullUrl(cert.image_url)}
                    alt={cert.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-60"></div>
                </div>
              )}

              {/* Certificate Content */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <Award className="h-6 w-6 text-electric-500 flex-shrink-0" />
                  {cert.verification_link && (
                    <a
                      href={cert.verification_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      title="Verify Certificate"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                <h3 className="text-xl font-bold text-warm-50 mb-2 group-hover:text-electric-500 transition-colors line-clamp-2">
                  {cert.title}
                </h3>

                <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                  <Building2 className="h-4 w-4" />
                  <span className="line-clamp-1">{cert.issuing_organization}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>

                {/* Skill Tags */}
                {cert.skill_tags && (
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {cert.skill_tags
                      .split(',')
                      .slice(0, 3)
                      .map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-mono text-electric-400 bg-navy-900 rounded"
                        >
                          {tag.trim()}
                        </span>
                      ))}
                    {cert.skill_tags.split(',').length > 3 && (
                      <span className="px-2 py-1 text-xs font-mono text-slate-500">
                        +{cert.skill_tags.split(',').length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {certificates.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No certificates found.</p>
        </div>
      )}
    </div>
  );
}
