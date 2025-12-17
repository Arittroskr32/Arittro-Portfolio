import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ArrowRight } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string;
  github_url?: string;
  live_url?: string;
  image_url?: string;
  category: string;
  featured: boolean;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const techStack = project.technologies ? project.technologies.split(',').map(t => t.trim()).slice(0, 3) : [];

  return (
    <Card 
      className="flex flex-col h-full group cursor-pointer overflow-hidden" 
      hover
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {/* Project Image */}
      <div className="relative w-full h-48 bg-navy-900 rounded-lg overflow-hidden mb-4">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl text-navy-700">📁</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-60"></div>
        {project.featured && (
          <Badge variant="primary" className="absolute top-3 right-3">
            Featured
          </Badge>
        )}
      </div>

      {/* Project Content */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-warm-50 mb-2 group-hover:text-electric-500 transition-colors line-clamp-1">
          {project.title}
        </h3>

        <p className="text-slate-400 text-sm mb-4 flex-1 leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-4">
          {techStack.map(tech => (
            <span key={tech} className="px-2 py-1 text-xs font-mono text-electric-400 bg-navy-900 rounded">
              {tech}
            </span>
          ))}
          {project.technologies.split(',').length > 3 && (
            <span className="px-2 py-1 text-xs font-mono text-slate-500">
              +{project.technologies.split(',').length - 3} more
            </span>
          )}
        </div>

        {/* View Details Link */}
        <div className="flex items-center text-electric-500 text-sm font-medium group-hover:text-electric-400 transition-colors">
          View Details
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Card>
  );
}