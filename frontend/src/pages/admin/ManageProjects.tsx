import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, X, Upload } from 'lucide-react';
import { projectService } from '../../services/projectService';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

interface Project {
  id: number;
  title: string;
  description: string;
  long_description?: string;
  technologies: string;
  github_url?: string;
  live_url?: string;
  image_url?: string;
  category: string;
  featured: number;
  authors?: string;
  created_at: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  long_description: string;
  technologies: string;
  github_url: string;
  live_url: string;
  image_url: string;
  category: string;
  featured: boolean;
  authors: string;
}

const ManageProjects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    long_description: '',
    technologies: '',
    github_url: '',
    live_url: '',
    image_url: '',
    category: 'security',
    featured: false,
    authors: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('long_description', formData.long_description || '');
      formDataToSend.append('technologies', formData.technologies);
      formDataToSend.append('github_url', formData.github_url || '');
      formDataToSend.append('live_url', formData.live_url || '');
      formDataToSend.append('category', formData.category);
      formDataToSend.append('featured', formData.featured.toString());
      formDataToSend.append('authors', formData.authors || '');
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingProject) {
        await projectService.update(editingProject.id, formDataToSend);
      } else {
        await projectService.create(formDataToSend);
      }
      fetchProjects();
      closeModal();
    } catch (error: any) {
      console.error('Failed to save project:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to save project. Please try again.';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(id);
        fetchProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        long_description: project.long_description || '',
        technologies: project.technologies,
        github_url: project.github_url || '',
        live_url: project.live_url || '',
        image_url: project.image_url || '',
        category: project.category,
        featured: project.featured === 1,
        authors: project.authors || '',
      });
      setImagePreview(project.image_url || null);
      setImageFile(null);
    } else {
      setEditingProject(null);
      setFormData({
        title: '',
        description: '',
        long_description: '',
        technologies: '',
        github_url: '',
        live_url: '',
        image_url: '',
        category: 'security',
        featured: false,
        authors: '',
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = async () => {
    if (editingProject && editingProject.image_url && !imageFile) {
      if (window.confirm('Are you sure you want to delete this image? This cannot be undone.')) {
        try {
          await projectService.deleteImage(editingProject.id);
          setImagePreview(null);
          setImageFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          await fetchProjects();
          closeModal();
        } catch (error) {
          console.error('Failed to delete image:', error);
          alert('Failed to delete image. Please try again.');
        }
      }
    } else {
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Projects</h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading projects...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    {project.featured === 1 && (
                      <Badge variant="primary">Featured</Badge>
                    )}
                    <Badge variant="secondary">{project.category}</Badge>
                  </div>
                  <p className="text-gray-400 mb-3">{project.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.technologies.split(',').map((tech, index) => (
                      <Badge key={index} variant="outline">
                        {tech.trim()}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-400"
                      >
                        GitHub →
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-cyan-400"
                      >
                        Live Demo →
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(project)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white"
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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Long Description
                </label>
                <Textarea
                  value={formData.long_description}
                  onChange={(e) =>
                    setFormData({ ...formData, long_description: e.target.value })
                  }
                  rows={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Technologies (comma-separated) *
                </label>
                <Input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) =>
                    setFormData({ ...formData, technologies: e.target.value })
                  }
                  placeholder="React, Node.js, MySQL"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Authors (comma-separated)
                </label>
                <Input
                  type="text"
                  value={formData.authors}
                  onChange={(e) =>
                    setFormData({ ...formData, authors: e.target.value })
                  }
                  placeholder="John Doe, Jane Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                >
                  <option value="security">Security</option>
                  <option value="web">Web Development</option>
                  <option value="tool">Tool</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Project Image
                </label>
                <div className="space-y-3">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-700">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP (MAX. 5MB)</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GitHub URL
                  </label>
                  <Input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) =>
                      setFormData({ ...formData, github_url: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Live URL
                  </label>
                  <Input
                    type="url"
                    value={formData.live_url}
                    onChange={(e) =>
                      setFormData({ ...formData, live_url: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) =>
                    setFormData({ ...formData, featured: e.target.checked })
                  }
                  className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 text-sm font-medium text-gray-300"
                >
                  Featured Project
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProject ? 'Update Project' : 'Create Project'}
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

export default ManageProjects;
