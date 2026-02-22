import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { certificateService } from '../services/certificateService';
import { Certificate } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  ArrowLeft,
  Award,
  Calendar,
  Building2,
  ExternalLink,
  Tag,
} from 'lucide-react';

const VITE_API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8888/api';
const BACKEND_URL = String(VITE_API_URL).replace(/\/api\/?$/i, '');

const makeFullUrl = (p?: string | null) => {
  if (!p) return undefined;
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return `${BACKEND_URL}${p.startsWith('/') ? p : `/${p}`}`;
};

// Simple markdown to HTML converter for basic formatting
const parseMarkdown = (text: string): string => {
  if (!text) return '';
  
  let html = text;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-warm-50 mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-warm-50 mt-8 mb-4">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-warm-50 mt-8 mb-4">$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-warm-50 font-semibold">$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  
  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-navy-950 border border-navy-800 rounded-lg p-4 overflow-x-auto my-4"><code>$2</code></pre>');
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="text-electric-400 bg-navy-900 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 hover:text-cyan-300 underline">$1</a>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p class="text-slate-300 leading-relaxed mb-4">');
  html = html.replace(/\n/g, '<br/>');
  
  // Wrap in paragraph
  html = '<p class="text-slate-300 leading-relaxed mb-4">' + html + '</p>';
  
  return html;
};

export function CertificateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const fetchCertificate = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await certificateService.getById(parseInt(id));
      setCertificate(data);
    } catch (error) {
      console.error('Failed to fetch certificate:', error);
      setError('Failed to load certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Certificate Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The requested certificate could not be found.'}</p>
          <Button onClick={() => navigate('/certificate')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Certificates
          </Button>
        </div>
      </div>
    );
  }

  const skillTags = certificate.skill_tags ? certificate.skill_tags.split(',').map(t => t.trim()) : [];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/certificate"
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Certificates
        </Link>
      </motion.div>

      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            {certificate.image_url && (
              <div className="rounded-lg overflow-hidden bg-navy-800">
                <img
                  src={makeFullUrl(certificate.image_url)}
                  alt={certificate.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className={certificate.image_url ? '' : 'md:col-span-2'}>
              <div className="flex items-start gap-4 mb-6">
                <Award className="w-12 h-12 text-electric-500 flex-shrink-0" />
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-white mb-2">{certificate.title}</h1>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <Building2 className="w-5 h-5 text-cyan-500" />
                  <div>
                    <p className="text-sm text-gray-500">Issuing Organization</p>
                    <p className="font-semibold">{certificate.issuing_organization}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">Issue Date</p>
                    <p className="font-semibold">
                      {new Date(certificate.issue_date).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {certificate.verification_link && (
                <a
                  href={certificate.verification_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Verify Certificate <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Description */}
      {certificate.description && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">About This Certificate</h2>
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(certificate.description) }}
            />
          </Card>
        </motion.div>
      )}

      {/* Skills & Tags */}
      {skillTags.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Tag className="w-6 h-6 text-electric-500" />
              <h2 className="text-2xl font-bold text-white">Skills & Technologies</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {skillTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 text-sm font-mono text-electric-400 bg-navy-900 border border-navy-700 rounded-lg"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
