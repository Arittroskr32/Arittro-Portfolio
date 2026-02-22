import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, User, Code, Shield, Terminal, FileText, Mail, Github, Linkedin, Twitter, Lock, Award } from 'lucide-react';
const navItems = [{
  name: 'Home',
  path: '/',
  icon: Home
}, {
  name: 'About',
  path: '/about',
  icon: User
}, {
  name: 'Skills',
  path: '/skills',
  icon: Code
}, {
  name: 'Projects',
  path: '/projects',
  icon: Terminal
}, {
  name: 'Certificates',
  path: '/certificate',
  icon: Award
}, {
  name: 'CTF & Bounty',
  path: '/ctf-bug-bounty',
  icon: Shield
}, {
  name: 'Blog',
  path: '/blog',
  icon: FileText
}, {
  name: 'Contact',
  path: '/contact',
  icon: Mail
}];
const socialLinks = [{
  icon: Github,
  href: 'https://github.com/Arittroskr32'
}, {
  icon: Linkedin,
  href: 'https://www.linkedin.com/in/arittro-sarkar-01780a301/'
}, {
  icon: Twitter,
  href: 'https://x.com/arittroskr'
}];
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export function Sidebar({
  isOpen,
  setIsOpen
}: SidebarProps) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;
  return <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />}

      {/* Sidebar Container */}
      <aside className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 bg-navy-900 border-r border-navy-800
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:sticky lg:h-screen
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
        <div className="h-full flex flex-col p-6 overflow-y-auto">
          {/* Logo/Identity */}
          <div className="mb-10">
            <h1 className="text-xl font-bold tracking-tight text-warm-50">
              ARITTRO<span className="text-electric-500">.</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">Security Enthusiast</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return <NavLink key={item.path} to={item.path} onClick={() => setIsOpen(false)} className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isActive ? 'bg-electric-500/10 text-electric-500' : 'text-slate-400 hover:bg-navy-800 hover:text-warm-50'}
                  `}>
                  <item.icon className={`mr-3 h-4 w-4 ${isActive ? 'text-electric-500' : 'text-slate-500 group-hover:text-warm-50'}`} />
                  {item.name}
                  {isActive && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-electric-500" />}
                </NavLink>;
          })}
          </nav>

          {/* Footer / Socials */}
          <div className="mt-auto pt-6 border-t border-navy-800">
            <div className="flex justify-center space-x-4 mb-6">
              {socialLinks.map((link, i) => <a key={i} href={link.href} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-electric-500 transition-colors">
                  <link.icon className="h-5 w-5" />
                </a>)}
            </div>

            <NavLink to="/admin/login" className="flex items-center justify-center text-xs text-slate-600 hover:text-slate-400 transition-colors">
              <Lock className="h-3 w-3 mr-1" />
              Admin Access
            </NavLink>
          </div>
        </div>
      </aside>
    </>;
}