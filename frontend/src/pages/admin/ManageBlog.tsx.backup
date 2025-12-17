import React, { useState, useEffect } from 'react';
import { BlogPost as BlogPostType } from '../../types';
import { Plus, Edit, Trash2, Search, X, Eye } from 'lucide-react';
import { blogService } from '../../services/blogService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string | null;
  featured_image?: string | null;
  published: number; // 0 or 1 from backend
  created_at: string;
  updated_at: string;
}

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string;
  featured_image: string;
  published: boolean; // UI uses boolean, we convert to number before sending
}

const ManageBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    author: 'Arittro Sarkar',
    category: 'Web Security',
    tags: '',
    featured_image: '',
    published: false,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data: BlogPostType[] = await blogService.getAll();
      setPosts(data || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize payload for API (convert boolean -> number for published)
    const payload: Omit<BlogPostType, 'id'> = {
      ...formData,
      published: formData.published ? 1 : 0,
      date: new Date().toISOString(),
      readTime: '5 min',
      category: formData.category as BlogPostType['category'],
    };
    try {
      if (editingPost) {
        await blogService.update(String(editingPost.id), payload);
      } else {
        await blogService.create(payload);
      }
      await fetchPosts();
      closeModal();
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Failed to save post. Please try again.');
    }
  };

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await blogService.delete(String(id));
        await fetchPosts();
      } catch (error) {
        console.error('Failed to delete post:', error);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  const openModal = (post?: BlogPost) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        content: post.content || '',
        author: post.author || 'Arittro Sarkar',
        category: post.category || 'security',
        tags: post.tags || '',
        featured_image: post.featured_image || '',
        published: post.published === 1,
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        author: 'Arittro Sarkar',
        category: 'security',
        tags: '',
        featured_image: '',
        published: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPost(null);
  };

  const normalizedSearch = searchTerm.toLowerCase();
  const filteredPosts = posts.filter((post) => {
    const title = (post.title || '').toLowerCase();
    const excerpt = (post.excerpt || '').toLowerCase();
    const category = (post.category || '').toLowerCase();
    return (
      title.includes(normalizedSearch) ||
      excerpt.includes(normalizedSearch) ||
      category.includes(normalizedSearch)
    );
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Blog Posts</h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Post
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading posts...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPosts.map((post) => {
            const tagsArray =
              post.tags
                ?.split(',')
                .map((t: string) => t.trim())
                .filter((t: string) => t.length > 0) || [];

            return (
              <Card key={post.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {post.title}
                      </h3>
                      {post.published === 1 ? (
                        <Badge variant="success">Published</Badge>
                      ) : (
                        <Badge variant="warning">Draft</Badge>
                      )}
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    <p className="text-gray-400 mb-3">{post.excerpt}</p>
                    {tagsArray.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tagsArray.map((tag: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      By {post.author} •{' '}
                      {post.created_at
                        ? new Date(post.created_at).toLocaleDateString()
                        : ''}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() =>
                        window.open(`/blog/${post.slug}`, '_blank')
                      }
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => openModal(post)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => handleDelete(post.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingPost ? 'Edit Blog Post' : 'Add New Blog Post'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
                type="button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug *
                </label>
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: /blog/{formData.slug || 'your-post-slug'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Excerpt *
                </label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
                  }
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content * (Supports Markdown)
                </label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={12}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Author *
                  </label>
                  <Input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    <option value="security">Security</option>
                    <option value="ctf">CTF Writeup</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="research">Research</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags (comma-separated) *
                </label>
                <Input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tags: e.target.value,
                    }))
                  }
                  placeholder="web security, penetration testing, bug bounty"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Featured Image URL
                </label>
                <Input
                  type="url"
                  value={formData.featured_image}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured_image: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      published: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <label
                  htmlFor="published"
                  className="ml-2 text-sm font-medium text-gray-300"
                >
                  Publish immediately
                </label>
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBlog;
