import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, ExternalLink, Calendar, Tag as TagIcon } from 'lucide-react';
import { projectService } from '../services/projectService';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

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
  featured: number | boolean;
  authors?: string;
  created_at?: string;
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id));
    }
  }, [id]);

  const fetchProject = async (projectId: number) => {
    try {
      setLoading(true);
      const data = await projectService.getById(projectId);
      setProject(data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Project not found</h2>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const techStack = project.technologies ? project.technologies.split(',').map(t => t.trim()) : [];

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Button
          variant="outline"
          onClick={() => navigate('/projects')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>
      </motion.div>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-4xl font-bold text-warm-50">{project.title}</h1>
          {project.featured === 1 && (
            <Badge variant="accent" className="text-sm">Featured</Badge>
          )}
          <Badge variant="default" className="text-sm">{project.category}</Badge>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">
              {project.created_at && new Date(project.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </div>

        {project.authors && (
          <div className="text-slate-400">
            <span className="font-semibold text-slate-300">Authors:</span> {project.authors}
          </div>
        )}

        <p className="text-slate-300 text-lg leading-relaxed">
          {project.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          {project.github_url && (
            <Button
              onClick={() => window.open(project.github_url, '_blank')}
              className="bg-navy-800 hover:bg-navy-700"
            >
              <Github className="w-5 h-5 mr-2" />
              View on GitHub
            </Button>
          )}
          {project.live_url && (
            <Button
              onClick={() => window.open(project.live_url, '_blank')}
              variant="outline"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Live Demo
            </Button>
          )}
        </div>
      </motion.div>

      {/* Project Image */}
      {project.image_url && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative w-full rounded-xl overflow-hidden bg-navy-900"
        >
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-auto max-h-[400px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-40"></div>
        </motion.div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-warm-50 mb-6 flex items-center gap-3">
              <div className="w-1 h-8 bg-electric-500 rounded-full"></div>
              About This Project
            </h2>
            <div className="prose prose-invert max-w-none">
              {project.long_description ? (
                <div className="text-slate-300 leading-relaxed text-justify whitespace-pre-wrap">
                  {project.long_description}
                </div>
              ) : (
                <p className="text-slate-400 italic">
                  No detailed description available for this project.
                </p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 space-y-6"
        >
          {/* Technologies Card */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-warm-50 mb-4 flex items-center gap-2">
              <TagIcon className="w-5 h-5 text-electric-500" />
              Technologies
            </h3>
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech, index) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="px-3 py-2 text-sm font-mono text-electric-400 bg-navy-900 rounded-lg border border-navy-800 hover:border-electric-500 transition-colors"
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </Card>

          {/* Links Card */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-warm-50 mb-4">Quick Links</h3>
            <div className="space-y-3">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-navy-900 hover:bg-navy-800 transition-colors group"
                >
                  <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Source Code</div>
                    <div className="text-xs text-slate-400">View on GitHub</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-electric-500 transition-colors" />
                </a>
              )}
              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg bg-navy-900 hover:bg-navy-800 transition-colors group"
                >
                  <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">Live Demo</div>
                    <div className="text-xs text-slate-400">Try it out</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-electric-500 transition-colors" />
                </a>
              )}
              {!project.github_url && !project.live_url && (
                <p className="text-slate-400 text-sm italic p-3">
                  No external links available
                </p>
              )}
            </div>
          </Card>

          {/* Project Info Card */}
          <Card className="p-6 bg-navy-900 border-navy-800">
            <h3 className="text-xl font-bold text-warm-50 mb-4">Project Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-slate-400 mb-1">Category</div>
                <div className="text-white font-medium capitalize">{project.category}</div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Created</div>
                <div className="text-white font-medium">
                  {project.created_at && new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </div>
              </div>
              <div>
                <div className="text-slate-400 mb-1">Status</div>
                <div className="text-electric-400 font-medium">
                  {project.featured === 1 ? 'Featured Project' : 'Active'}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
