import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { QuickHighlights } from '../components/home/QuickHighlights';
import { TechStack } from '../components/home/TechStack';
import { Card } from '../components/ui/Card';
import { ArrowRight, Award, Calendar, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { generalService, ProfileContent } from '../services/generalService';
import { projectService } from '../services/projectService';
import { blogService, BlogPost } from '../services/blogService';
import { certificateService } from '../services/certificateService';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Certificate, Project } from '../types';

const VITE_API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8888/api';
const BACKEND_URL = String(VITE_API_URL).replace(/\/api\/?$/i, '');

const makeFullUrl = (p?: string | null) => {
  if (!p) return undefined;
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  return `${BACKEND_URL}${p.startsWith('/') ? p : `/${p}`}`;
};

export function Home() {
  const [heroContent, setHeroContent] = useState<ProfileContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [featuredCertificates, setFeaturedCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch hero content
        const profileData = await generalService.getProfileContent();
        setHeroContent(profileData);

        // Fetch featured projects
        const projects = await projectService.getAll(true);
        setFeaturedProjects(projects.slice(0, 3));

        // Fetch latest blog posts
        const blogs = await blogService.getAll();
        setLatestPosts(blogs.slice(0, 3));

        // Fetch top certificates by rank
        const certificates = await certificateService.getAll();
        const sortedCertificates = [...certificates].sort((a, b) => {
          const rankA = Number.isFinite(a.rank) ? a.rank : Number.MAX_SAFE_INTEGER;
          const rankB = Number.isFinite(b.rank) ? b.rank : Number.MAX_SAFE_INTEGER;
          return rankA - rankB;
        });
        setFeaturedCertificates(sortedCertificates.slice(0, 3));
      } catch (error) {
        console.error('Failed to fetch data:', error);
        // Use fallback content if API fails
        setHeroContent({
          hero_title: 'Arittro Sarkar (Devil@32)',
          hero_subtitle: 'Cybersecurity Enthusiast & Full-Stack Developer',
          hero_tagline: '',
          hero_description: "I specialize in web exploitation, vulnerability research, and creating defensive tools to bridge the gap between offensive security and secure development.",
          about_intro: '',
          about_journey: '',
          about_current: '',
          about_philosophy: ''
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return <div className="space-y-20">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex flex-col justify-center">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading...</p>
          </div>
        ) : (
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.5
          }}>
            <span className="text-electric-500 font-mono mb-4 block">
              Hi, my name is
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-warm-50 mb-4 tracking-tight">
              {heroContent?.hero_title || 'Arittro Sarkar.'}
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-400 mb-6 tracking-tight">
              {heroContent?.hero_subtitle || 'Cybersecurity Specialist & Full-Stack Developer'}
            </h2>
            <h3 className="text-4xl md:text-6xl font-bold text-slate-400 mb-8 tracking-tight">
              Breaking <span className="text-electric-500">→</span> Learning{' '}
              <span className="text-electric-500">→</span> Securing
            </h3>
            <p className="text-lg text-slate-400 max-w-2xl mb-10 leading-relaxed">
              {heroContent?.hero_description || "I'm a Security Researcher and CTF Player specializing in web exploitation, vulnerability research, and building defensive tools. I bridge the gap between offensive security and secure application development."}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/projects">
                <Button withArrow>View Projects</Button>
              </Link>
              <Link to="/ctf-bug-bounty">
                <Button variant="outline">CTF & Bug Bounty</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </section>

      {/* Quick Stats */}
      <QuickHighlights />

      {/* Featured Projects */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-2xl font-bold text-warm-50">Featured Projects</h3>
          <Link to="/projects" className="text-electric-500 hover:text-electric-400 text-sm flex items-center">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project, index) => (
            <motion.div 
              key={project.id} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={{ delay: index * 0.1 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Certificates */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-2xl font-bold text-warm-50">Featured Certificates</h3>
          <Link to="/certificate" className="text-electric-500 hover:text-electric-400 text-sm flex items-center">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        {featuredCertificates.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No certificates to show yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCertificates.map((cert, index) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/certificate/${cert.id}`}>
                  <Card hover className="group h-full flex flex-col overflow-hidden">
                    {cert.image_url && (
                      <div className="relative w-full h-40 bg-navy-900 rounded-lg overflow-hidden mb-4">
                        <img
                          src={makeFullUrl(cert.image_url)}
                          alt={cert.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-transparent opacity-60"></div>
                      </div>
                    )}
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <Award className="h-6 w-6 text-electric-500 flex-shrink-0" />
                        <span className="text-xs font-mono text-slate-500">Rank #{cert.rank}</span>
                      </div>
                      <h4 className="text-lg font-bold text-warm-50 mb-2 group-hover:text-electric-500 transition-colors line-clamp-2">
                        {cert.title}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                        <Building2 className="h-4 w-4" />
                        <span className="line-clamp-1">{cert.issuing_organization}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(cert.issue_date).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Tech Stack */}
      <TechStack />

      {/* Latest Blog Posts */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <h3 className="text-2xl font-bold text-warm-50">Latest Articles</h3>
          <Link to="/blog" className="text-electric-500 hover:text-electric-400 text-sm flex items-center">
            Read blog <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="space-y-4">
          {latestPosts.map((post, index) => <motion.div key={post.id} initial={{
          opacity: 0,
          x: -20
        }} whileInView={{
          opacity: 1,
          x: 0
        }} viewport={{
          once: true
        }} transition={{
          delay: index * 0.1
        }}>
              <Link to={`/blog/${post.id}`}>
                <Card hover className="group cursor-pointer">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <h4 className="text-lg font-bold text-warm-50 group-hover:text-electric-500 transition-colors">
                        {post.title}
                      </h4>
                      <p className="text-slate-400 text-sm mt-1 max-w-2xl line-clamp-2">
                        {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500 font-mono whitespace-nowrap">
                      <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full" />
                      <span className="text-electric-500">{post.category}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>)}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 text-center">
        <h3 className="text-3xl font-bold text-warm-50 mb-6">
          Interested in collaborating?
        </h3>
        <p className="text-slate-400 max-w-xl mx-auto mb-8">
          I'm always open to discussing new projects, security research
          opportunities, or just chatting about the latest CTF challenges. Just reach out!
        </p>
        <Link to="/contact">
          <Button>Get In Touch</Button>
        </Link>
      </section>
    </div>;
}