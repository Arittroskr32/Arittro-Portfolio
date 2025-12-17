import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
interface Project {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  size: 'small' | 'large';
}
const projects: Project[] = [{
  id: 1,
  title: 'Fintech Dashboard',
  category: 'Web Application',
  description: 'A comprehensive financial analytics platform featuring real-time data visualization, transaction tracking, and predictive modeling.',
  image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  tags: ['React', 'TypeScript', 'D3.js', 'Node.js'],
  size: 'large'
}, {
  id: 2,
  title: 'Lumina',
  category: 'E-commerce',
  description: 'Minimalist lifestyle brand store with headless architecture.',
  image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  tags: ['Next.js', 'Shopify', 'Tailwind'],
  size: 'small'
}, {
  id: 3,
  title: 'TaskFlow',
  category: 'Productivity',
  description: 'Collaborative project management tool for remote teams.',
  image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  tags: ['Vue', 'Firebase', 'PWA'],
  size: 'small'
}, {
  id: 4,
  title: 'Architectural Portfolio',
  category: 'Website',
  description: 'Immersive portfolio for an award-winning architecture firm featuring WebGL interactions.',
  image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
  tags: ['Three.js', 'GSAP', 'React'],
  size: 'large'
}];
export function Projects() {
  return <section id="projects" className="py-32 bg-navy-900 relative">
      <div className="container mx-auto px-6">
        <div className="mb-20 max-w-2xl">
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-sm font-bold text-electric-500 uppercase tracking-widest mb-4">
            Selected Work
          </motion.h2>
          <motion.h3 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: 0.1
        }} className="text-3xl md:text-4xl font-bold text-warm-50">
            Digital products crafted with <br /> precision and passion.
          </motion.h3>
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => <motion.article key={project.id} initial={{
          opacity: 0,
          y: 40
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true,
          margin: '-50px'
        }} transition={{
          duration: 0.6,
          delay: index * 0.1
        }} className={`group relative bg-navy-800 overflow-hidden ${project.size === 'large' ? 'md:col-span-2 aspect-[2/1]' : 'aspect-square'}`}>
              {/* Image Background */}
              <div className="absolute inset-0 overflow-hidden">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-60 group-hover:opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent opacity-90" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-electric-500 text-sm font-medium mb-2">
                        {project.category}
                      </p>
                      <h4 className="text-2xl md:text-3xl font-bold text-warm-50 mb-3">
                        {project.title}
                      </h4>
                    </div>
                    <a href="#" className="p-3 bg-white/10 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-electric-500">
                      <ArrowUpRight size={20} />
                    </a>
                  </div>

                  <p className="text-slate-300 mb-6 max-w-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2 md:line-clamp-none">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    {project.tags.map(tag => <span key={tag} className="px-3 py-1 text-xs border border-slate-600 text-slate-300 rounded-full">
                        {tag}
                      </span>)}
                  </div>
                </div>
              </div>
            </motion.article>)}
        </div>
      </div>
    </section>;
}