import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { blogService, BlogPost } from '../services/blogService';
import { Search, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';
const BACKEND_URL = String(VITE_API_URL).replace(/\/api\/?$/i, '');
const makeFullUrl = (p?: string | null) => {
  if (!p) return undefined;
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return `${BACKEND_URL}${p.startsWith('/') ? p : `/${p}`}`;
};

export function Blog() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const data = await blogService.getAll();
      setBlogPosts(data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category).filter(Boolean)))];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getExcerpt = (content: string) => {
    const text = content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return text.length > 200 ? text.substring(0, 200) + '...' : text;
  };

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-warm-50 mb-4">Blog</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Technical writeups, security research, and thoughts on the industry.
        </p>
      </motion.div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b border-navy-800 pb-6">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                ${
                  selectedCategory === category
                    ? 'bg-electric-500 text-white'
                    : 'bg-navy-800 text-slate-400 hover:text-white'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-800/50 border border-navy-700 rounded-lg text-sm text-warm-50 focus:outline-none focus:border-electric-500 transition-colors"
          />
        </div>
      </div>

      {/* Blog Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading blogs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/blog/${post.id}`}>
                <Card hover className="group h-full min-h-0">
                  <div className="flex flex-col md:flex-row gap-6">
                        {post.image_url && (
                      <div className="w-full md:w-40 h-40 flex-shrink-0">
                        <img
                              src={makeFullUrl(post.image_url)}
                          alt={post.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        {post.category && (
                          <Badge variant="outline">{post.category}</Badge>
                        )}
                        {post.tags && post.tags.split(',').map((tag, idx) => (
                          <Badge key={idx} variant="secondary">{tag.trim()}</Badge>
                        ))}
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{' '}
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-warm-50 mb-3 group-hover:text-electric-500 transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-slate-400 leading-relaxed">
                        {getExcerpt(post.content)}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}

          {filteredPosts.length === 0 && (
            <div className="text-center py-20 text-slate-500">
              No articles found matching your criteria.
            </div>
          )}
        </div>
      )}
    </div>
  );
}