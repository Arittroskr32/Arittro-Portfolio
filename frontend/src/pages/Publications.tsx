import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText } from 'lucide-react';
import { Publication } from '../types';
import { groupPublications, publicationService } from '../services/publicationService';

export function Publications() {
  const [pubs, setPubs] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicationService
      .getAll()
      .then(setPubs)
      .catch((e) => console.error('Failed to fetch publications:', e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading publications...</p>
      </div>
    );
  }

  const groups = groupPublications(pubs);

  return (
    <div className="space-y-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-warm-50 mb-4">Publications</h1>
        <p className="text-slate-400 text-lg max-w-2xl">Research papers I have contributed to.</p>
      </motion.div>

      {groups.length === 0 && <p className="text-slate-500">No publications yet.</p>}

      {groups.map((group, gi) => (
        <motion.section
          key={group.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * gi }}
          className="space-y-8"
        >
          <h2 className="text-2xl font-bold text-warm-50 border-b border-navy-800 pb-3">{group.type}</h2>

          {group.years.map(({ year, papers }) => (
            <div key={year} className="grid grid-cols-1 md:grid-cols-[5rem_1fr] gap-4">
              <div className="text-electric-500 font-mono font-semibold text-lg md:pt-5">{year || '—'}</div>
              <div className="space-y-4">
                {papers.map((p) => (
                  <div
                    key={p.id}
                    className="bg-navy-800/50 backdrop-blur-sm border border-navy-700 rounded-xl p-5 hover:border-electric-500/40 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-warm-50 leading-snug">{p.title}</h3>
                    {p.authors && <p className="text-slate-400 text-sm mt-2">{p.authors}</p>}
                    {(p.venue || p.track) && (
                      <p className="text-sm mt-1">
                        {p.venue && <span className="text-electric-400 font-medium">{p.venue}</span>}
                        {p.venue && p.track && <span className="text-slate-600"> · </span>}
                        {p.track && <span className="text-slate-400 italic">{p.track}</span>}
                      </p>
                    )}
                    {p.links?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {p.links.map((l, i) => (
                          <a
                            key={i}
                            href={l.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border border-navy-600 text-slate-300 hover:border-electric-500 hover:text-electric-500 transition-colors"
                          >
                            {i === 0 ? <FileText className="h-3 w-3" /> : <ExternalLink className="h-3 w-3" />}
                            {l.label || 'Link'}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.section>
      ))}
    </div>
  );
}
