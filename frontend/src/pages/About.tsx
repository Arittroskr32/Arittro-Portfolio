import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Terminal, Shield, Code, Coffee } from 'lucide-react';
import { generalService, JourneyHighlight } from '../services/generalService';

export function About() {
  const [aboutContent, setAboutContent] = useState<string>('');
  const [journeyHighlights, setJourneyHighlights] = useState<JourneyHighlight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, journeyData] = await Promise.all([
          generalService.getProfileContent(),
          generalService.getJourneyHighlights()
        ]);
        
        setAboutContent(profileData.about || '');
        setJourneyHighlights(journeyData);
      } catch (error) {
        console.error('Failed to fetch about data:', error);
        // Fallback content
        setAboutContent(`I'm a cybersecurity enthusiast specializing in CTF challenges, web exploitation, and secure application development. I operate at the intersection of offensive security and software engineering.

Currently, I'm a student and active CTF player, spending my time exploring attack surfaces, building defensive tools, and learning through breaking. My journey started with full-stack development, but the thrill of understanding how things break led me down the rabbit hole of security.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return <div className="w-full space-y-16">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="space-y-6">
        <h1 className="text-4xl font-bold text-warm-50">About Me</h1>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Loading...</p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-slate-400">
            <div 
              className="text-lg leading-relaxed whitespace-pre-line"
              dangerouslySetInnerHTML={{ 
                __html: aboutContent
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="text-electric-500 font-bold">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em class="text-slate-300 italic">$1</em>')
                  .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-warm-50 mb-4 mt-6">$1</h1>')
                  .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold text-warm-50 mb-3 mt-5">$1</h2>')
                  .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold text-warm-50 mb-2 mt-4">$1</h3>')
                  .replace(/\n\n/g, '</p><p class="mb-4 text-slate-300 leading-relaxed">')
                  .replace(/^(.+)$/gm, (match) => {
                    if (!match.startsWith('<') && match.trim()) {
                      return `<p class="mb-4 text-slate-300 leading-relaxed">${match}</p>`;
                    }
                    return match;
                  })
              }}
            />
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} whileInView={{
        opacity: 1,
        x: 0
      }} viewport={{
        once: true
      }}>
          <h2 className="text-2xl font-bold text-warm-50 mb-6 flex items-center gap-2">
            <Terminal className="text-electric-500" />
            What I Do Now
          </h2>
          <ul className="space-y-4 text-slate-400">
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-electric-500 flex-shrink-0" />
              <span>Participating in CTFs (Web/Pwn/Misc focus)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-electric-500 flex-shrink-0" />
              <span>Bug Bounty hunting on HackerOne & Bugcrowd</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-electric-500 flex-shrink-0" />
              <span>Building security automation tools & Projects</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-electric-500 flex-shrink-0" />
              <span>Writing technical Writeups, Blogs.</span>
            </li>
          </ul>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        x: 20
      }} whileInView={{
        opacity: 1,
        x: 0
      }} viewport={{
        once: true
      }}>
          <h2 className="text-2xl font-bold text-warm-50 mb-6 flex items-center gap-2">
            <Shield className="text-electric-500" />
            Philosophy
          </h2>
          <Card className="bg-navy-800/50 border-l-4 border-l-electric-500">
            <blockquote className="text-lg italic text-slate-300 mb-4">
              "Breaking things to learn how to secure them."
            </blockquote>
            <p className="text-sm text-slate-400">
              I believe the best way to secure a system is to understand exactly
              how an attacker would dismantle it. My approach is cyclical:
              Break → Learn → Secure.
            </p>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }}>
        <h2 className="text-2xl font-bold text-warm-50 mb-6">
          Journey Highlights
        </h2>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-500 mx-auto"></div>
          </div>
        ) : journeyHighlights.length > 0 ? (
          <div className="relative border-l border-navy-700 ml-3 space-y-8 pl-8 py-2">
            {journeyHighlights.map((highlight, index) => (
              <div key={highlight.id} className="relative">
                <span className={`absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-navy-900 ${
                  highlight.is_featured ? 'bg-electric-500' : 'bg-slate-600'
                }`} />
                <span className={`text-xs font-mono mb-1 block ${
                  highlight.is_featured ? 'text-electric-500' : 'text-slate-500'
                }`}>
                  {highlight.year}
                </span>
                <h3 className="text-lg font-bold text-warm-50">
                  {highlight.title}
                </h3>
                <p className="text-slate-400">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-center py-8">No journey highlights added yet.</p>
        )}
      </motion.div>
    </div>;
}