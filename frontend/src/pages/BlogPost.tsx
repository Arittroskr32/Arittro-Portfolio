import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { blogService, BlogPost as BlogPostType } from '../services/blogService';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';
const BACKEND_URL = String(VITE_API_URL).replace(/\/api\/?$/i, '');
const makeFullUrl = (p?: string | null) => {
  if (!p) return undefined;
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return `${BACKEND_URL}${p.startsWith('/') ? p : `/${p}`}`;
};
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const data = await blogService.getById(id!);
      setPost(data);
    } catch (error) {
      console.error('Failed to fetch blog post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-warm-50 mb-4">Post Not Found</h1>
        <p className="text-slate-400 mb-8">
          The article you are looking for does not exist.
        </p>
        <Link to="/blog">
          <Button variant="outline">Back to Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/blog"
          className="inline-flex items-center text-sm text-slate-500 hover:text-electric-500 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Articles
        </Link>

        {/* Metadata: Date, Category, Tags */}
        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />{' '}
            {new Date(post.created_at).toLocaleDateString()}
          </span>
          {post.category && (
            <span className="flex items-center gap-1.5 text-electric-500">
              <Tag className="h-4 w-4" /> {post.category}
            </span>
          )}
          {post.tags && post.tags.split(',').map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-navy-800 rounded text-xs text-red-400">
              {tag.trim()}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-warm-50 mb-8 leading-tight">
          {post.title}
        </h1>

        {/* Featured Image */}
        {post.image_url && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img
              src={makeFullUrl(post.image_url)}
              alt={post.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Content with styled code blocks */}
        <div 
          className="prose prose-invert prose-lg max-w-none 
            prose-headings:text-warm-50 
            prose-a:text-cyan-400 prose-a:font-medium prose-a:underline prose-a:decoration-cyan-500/50 prose-a:underline-offset-4
            hover:prose-a:text-cyan-300 hover:prose-a:decoration-cyan-400
            prose-a:transition-all prose-a:duration-200
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-strong:text-warm-50 prose-strong:font-semibold
            prose-code:text-electric-400 prose-code:bg-navy-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-navy-950 prose-pre:border prose-pre:border-navy-800 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:shadow-lg
            prose-pre:max-w-full [&_pre]:!bg-navy-950 [&_pre]:!border-navy-800
            prose-li:text-slate-300
            prose-ul:text-slate-300
            prose-ol:text-slate-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </motion.div>
    </article>
  );
}