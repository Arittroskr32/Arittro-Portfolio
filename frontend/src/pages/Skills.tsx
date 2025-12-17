import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SkillCategory } from '../components/skills/SkillCategory';
import { skillService } from '../services/skillService';
import { Shield, Terminal, Globe, Database, Wrench, Cloud, Code } from 'lucide-react';

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
}

export function Skills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await skillService.getAll();
      setSkills(data);
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Icon mapping for categories
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Offensive Security': <Shield className="h-6 w-6" />,
      'Development': <Terminal className="h-6 w-6" />,
      'Tools & Frameworks': <Wrench className="h-6 w-6" />,
      'Cloud & DevOps': <Cloud className="h-6 w-6" />,
      'Databases': <Database className="h-6 w-6" />,
    };
    return iconMap[category] || <Code className="h-6 w-6" />;
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading skills...</p>
        </div>
      </div>
    );
  }
  return <div className="max-w-4xl">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="mb-12">
        <h1 className="text-4xl font-bold text-warm-50 mb-4">
          Technical Skills
        </h1>
        <p className="text-slate-400 text-lg">
          A breakdown of my technical capabilities across offensive security,
          development, and tooling.
        </p>
      </motion.div>

      <div className="space-y-12">
        {Object.entries(groupedSkills).map(([category, categorySkills], index) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <SkillCategory
              title={category}
              skills={categorySkills}
              icon={getCategoryIcon(category)}
            />
          </motion.div>
        ))}
      </div>

      {/* Additional Context Section */}
      <motion.div initial={{
      opacity: 0
    }} whileInView={{
      opacity: 1
    }} viewport={{
      once: true
    }} className="mt-16 p-6 border border-navy-700 rounded-xl bg-navy-800/30">
        <h3 className="text-xl font-bold text-warm-50 mb-4">Methodology</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-400">
          <div>
            <strong className="block text-electric-500 mb-2">
              Reconnaissance
            </strong>
            <p>
              Deep asset discovery, subdomain enumeration, and technology
              profiling before touching any target.
            </p>
          </div>
          <div>
            <strong className="block text-electric-500 mb-2">Analysis</strong>
            <p>
              Manual code review and logic testing over automated scanners.
              Understanding the business logic is key.
            </p>
          </div>
          <div>
            <strong className="block text-electric-500 mb-2">
              Exploitation
            </strong>
            <p>
              Creating custom proof-of-concept scripts to demonstrate impact
              without causing damage.
            </p>
          </div>
        </div>
      </motion.div>
    </div>;
}