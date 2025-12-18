import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { blogService, BlogPost } from '../../services/blogService';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const ManageBlog: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data = await blogService.getAll();
      setBlogs(data);
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await blogService.delete(id);
        fetchBlogs();
      } catch (error) {
        console.error('Failed to delete blog:', error);
        alert('Failed to delete blog. Please try again.');
      }
    }
  };

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-warm-50">Manage Blog Posts</h1>
          <p className="text-slate-400 mt-1">Create and manage your blog content</p>
        </div>
        <Button onClick={() => navigate('/admin/blog/new')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Blog Post
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-800 border border-navy-700 rounded-lg text-warm-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Blog List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading blogs...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No blog posts found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredBlogs.map((blog) => (
            <Card key={blog.id} className="p-6">
              <div className="flex gap-4 items-start">
                {blog.image_url && (
                  <img
                    src={blog.image_url.startsWith('http://') || blog.image_url.startsWith('https://')
                      ? blog.image_url
                      : (String(import.meta.env.VITE_API_URL || 'http://localhost:8888/api').replace(/\/api\/?$/i, '')) + (blog.image_url.startsWith('/') ? blog.image_url : `/${blog.image_url}`)}
                    alt={blog.title}
                    className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-warm-50 truncate">{blog.title}</h3>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {blog.category && (
                          <Badge variant="secondary">{blog.category}</Badge>
                        )}
                        {blog.tags && blog.tags.split(',').map((tag, idx) => (
                          <Badge key={idx} variant="outline">{tag.trim()}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/blog/edit/${blog.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                  <div 
                    className="text-gray-400 text-sm line-clamp-2 max-w-full overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: blog.content }}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageBlog;
