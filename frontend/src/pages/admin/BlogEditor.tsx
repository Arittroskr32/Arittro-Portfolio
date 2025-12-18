import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, X } from 'lucide-react';
import { blogService } from '../../services/blogService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';

export const BlogEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    content: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deleteImage, setDeleteImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (id) {
      loadBlog();
    }
  }, [id]);

  const loadBlog = async () => {
    try {
      const blog = await blogService.getById(id!);
      // Strip all <br> tag variations (including <br>, <br/>, <br />) and convert to newlines
      const contentForEditing = blog.content.replace(/<br\s*\/?>/gi, '\n');
      setFormData({
        title: blog.title,
        category: blog.category,
        tags: blog.tags || '',
        content: contentForEditing
      });
      const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8888/api';
      const BACKEND_URL = String(VITE_API_URL).replace(/\/api\/?$/i, '');
      const makeFullUrl = (p?: string | null) => {
        if (!p) return null;
        if (p.startsWith('http://') || p.startsWith('https://')) return p;
        return `${BACKEND_URL}${p.startsWith('/') ? p : `/${p}`}`;
      };

      setImagePreview(blog.image_url && (blog.image_url.startsWith('http://') || blog.image_url.startsWith('https://'))
        ? blog.image_url
        : makeFullUrl(blog.image_url));
    } catch (error) {
      console.error('Failed to load blog:', error);
      alert('Failed to load blog post');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setDeleteImage(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setDeleteImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const insertHTMLTag = (tag: string) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText = '';
    let openTag = '';
    let closeTag = '';

    switch (tag) {
      case 'bold':
        openTag = '<b>';
        closeTag = '</b>';
        break;
      case 'italic':
        openTag = '<i>';
        closeTag = '</i>';
        break;
      case 'underline':
        openTag = '<u>';
        closeTag = '</u>';
        break;
      case 'link':
        openTag = '<a href="url">';
        closeTag = '</a>';
        break;
      case 'code':
        openTag = '<pre><code class="language-javascript">\n';
        closeTag = '\n</code></pre>';
        break;
      case 'h2':
        openTag = '<h2>';
        closeTag = '</h2>';
        break;
      case 'h3':
        openTag = '<h3>';
        closeTag = '</h3>';
        break;
      case 'p':
        openTag = '<p>';
        closeTag = '</p>';
        break;
      default:
        return;
    }

    // Check if selected text already has the tag (toggle functionality)
    const hasOpenTag = selectedText.startsWith(openTag);
    const hasCloseTag = selectedText.endsWith(closeTag);
    
    if (hasOpenTag && hasCloseTag) {
      // Remove the tags
      newText = beforeText + selectedText.substring(openTag.length, selectedText.length - closeTag.length) + afterText;
    } else {
      // Add the tags
      newText = beforeText + openTag + (selectedText || getPlaceholderText(tag)) + closeTag + afterText;
    }

    setFormData({ ...formData, content: newText });
    
    // Set cursor position after the inserted tag
    setTimeout(() => {
      if (textarea) {
        const newCursorPos = start + openTag.length + (selectedText ? selectedText.length : getPlaceholderText(tag).length);
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const getPlaceholderText = (tag: string): string => {
    switch (tag) {
      case 'bold': return 'bold text';
      case 'italic': return 'italic text';
      case 'underline': return 'underlined text';
      case 'link': return 'link text';
      case 'code': return '// your code here';
      case 'h2': return 'Heading 2';
      case 'h3': return 'Heading 3';
      case 'p': return 'paragraph text';
      default: return 'text';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', formData.tags);
      // Strip all existing <br> tags (including <br>, <br/>, <br />) first, then convert newlines to <br>
      const contentWithBreaks = formData.content.replace(/<br\s*\/?>/gi, '\n').replace(/\n/g, '<br>');
      formDataToSend.append('content', contentWithBreaks);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      if (deleteImage && !imageFile) {
        formDataToSend.append('deleteImage', 'true');
      }

      if (id) {
        await blogService.update(parseInt(id), formDataToSend);
        alert('Blog updated successfully!');
      } else {
        await blogService.create(formDataToSend);
        alert('Blog created successfully!');
      }
      
      navigate('/admin/blog');
    } catch (error: any) {
      console.error('Failed to save blog:', error);
      alert(`Failed to save blog: ${error.message || 'Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/blog')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
            <h1 className="text-3xl font-bold text-warm-50">
              {id ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h1>
          </div>
        </div>

        {/* Editor Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Enter blog title"
              className="text-lg"
            />
          </div>

          {/* Category and Tags */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <Input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Web Security, CTF"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tags (comma-separated)
              </label>
              <Input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., XSS, SQL Injection"
              />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Featured Image
            </label>
            <div className="flex gap-4 items-start">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded border-2 border-navy-700"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Content * (HTML Supported)
            </label>
            
            {/* HTML Tag Buttons */}
            <div className="mb-3 flex flex-wrap gap-2 p-3 bg-navy-800 rounded-lg border border-navy-700">
              <Button type="button" size="sm" variant="outline" onClick={() => insertHTMLTag('bold')}>
                <b>B</b>
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => insertHTMLTag('italic')}>
                <i>I</i>
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => insertHTMLTag('underline')}>
                <u>U</u>
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => insertHTMLTag('link')}>
                Link
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => insertHTMLTag('code')}>
                Code
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => insertHTMLTag('h2')}>
                H2
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => insertHTMLTag('h3')}>
                H3
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => insertHTMLTag('p')}>
                P
              </Button>
            </div>

            {/* Content Textarea */}
            <Textarea
              ref={contentRef}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={35}
              placeholder="Write your blog content here. Line breaks will be preserved."
              className="font-mono text-sm"
              style={{ whiteSpace: 'pre-wrap' }}
            />
            
            <p className="text-xs text-slate-500 mt-2">
              Supported tags: &lt;b&gt;, &lt;i&gt;, &lt;u&gt;, &lt;a&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;pre&gt;&lt;code&gt;
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : (id ? 'Update Blog' : 'Create Blog')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/blog')}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
