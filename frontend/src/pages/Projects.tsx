import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ProjectCard } from '../components/projects/ProjectCard';
import { projectService } from '../services/projectService';
import { Tag } from '../components/ui/Tag';

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
  featured: boolean;
}

export function Projects() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Get unique categories from projects
  const categories = ['All', ...Array.from(new Set(projects.map(p => p.category)))];

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

  const filteredProjects = activeCategory === 'All' 
    ? projects 
    : projects.filter(p => p.category === activeCategory);

  if (loading) {
    return (
      <div className="space-y-12">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading projects...</p>
        </div>
      </div>
    );
  }
  return <div className="space-y-12">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }}>
        <h1 className="text-4xl font-bold text-warm-50 mb-4">Projects</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          A collection of security tools, full-stack applications, and
          open-source contributions.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-navy-800 pb-4">
        {categories.map(category => <button key={category} onClick={() => setActiveCategory(category)} className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeCategory === category ? 'bg-electric-500 text-white' : 'text-slate-400 hover:text-white hover:bg-navy-800'}
            `}>
            {category}
          </button>)}
      </div>

      {/* Projects Grid */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => <motion.div layout key={project.id} initial={{
        opacity: 0,
        scale: 0.9
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0,
        scale: 0.9
      }} transition={{
        duration: 0.2
      }}>
            <ProjectCard project={project} />
          </motion.div>)}
      </motion.div>
    </div>;
}