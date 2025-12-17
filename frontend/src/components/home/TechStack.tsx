import React from 'react';
import { Tag } from '../ui/Tag';
const technologies = ['Python', 'JavaScript', 'React', 'Node.js', 'Go', 'Docker', 'Linux', 'Burp Suite', 'Wireshark', 'Metasploit', 'Git', 'Bash', 'SQL', 'MongoDB'];
export function TechStack() {
  return <div className="w-full py-8 border-y border-navy-800 mb-16">
      <p className="text-sm text-slate-500 mb-4 uppercase tracking-widest font-semibold">
        Technologies & Tools
      </p>
      <div className="flex flex-wrap gap-2">
        {technologies.map(tech => <Tag key={tech} className="text-sm py-1.5 px-3">
            {tech}
          </Tag>)}
      </div>
    </div>;
}