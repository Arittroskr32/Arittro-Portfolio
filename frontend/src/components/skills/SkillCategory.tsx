import React from 'react';
import { Card } from '../ui/Card';

interface Skill {
  id: number;
  name: string;
  category: string;
  proficiency: number;
  icon?: string;
}

interface SkillCategoryProps {
  title: string;
  skills: Skill[];
  icon?: React.ReactNode;
}

export function SkillCategory({
  title,
  skills,
  icon
}: SkillCategoryProps) {
  return <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        {icon && <div className="text-electric-500">{icon}</div>}
        <h3 className="text-xl font-bold text-warm-50">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map(skill => <Card key={skill.id} className="p-4" hover>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-slate-300 group-hover:text-white transition-colors">
                {skill.name}
              </span>
              <span className="text-sm text-electric-500 font-semibold">{skill.proficiency}%</span>
            </div>
            <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-electric-500 to-cyan-400 rounded-full transition-all duration-300" 
                style={{ width: `${skill.proficiency}%` }} 
              />
            </div>
          </Card>)}
      </div>
    </div>;
}