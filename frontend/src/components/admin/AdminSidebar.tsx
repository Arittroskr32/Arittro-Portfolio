import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Folder, FileText, Shield, Bug, Code, User, Mail, Settings as SettingsIcon, LogOut, Award, ShieldAlert, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const adminNavItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/admin/projects', icon: Folder },
  { name: 'Blog Posts', path: '/admin/blog', icon: FileText },
  { name: 'Skills', path: '/admin/skills', icon: Code },
  { name: 'Certificates', path: '/admin/certificate', icon: Award },
  { name: 'CTF Entries', path: '/admin/ctf', icon: Shield },
  { name: 'CVEs', path: '/admin/cves', icon: ShieldAlert },
  { name: 'Bug Bounty', path: '/admin/bug-bounty', icon: Bug },
  { name: 'Messages', path: '/admin/messages', icon: Mail },
  { name: 'Profile', path: '/admin/profile', icon: User },
  { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
];

export function AdminSidebar() {
  const {
    logout
  } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };
  return <aside className="w-64 bg-navy-950 border-r border-navy-800 min-h-screen flex flex-col">
      <div className="p-6 border-b border-navy-800">
        <h1 className="text-lg font-bold text-warm-50 flex items-center gap-2">
          <Shield className="h-5 w-5 text-electric-500" />
          Admin Panel
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {adminNavItems.map(item => <NavLink key={item.path} to={item.path} className={({
        isActive
      }) => `
              flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
              ${isActive ? 'bg-electric-500/10 text-electric-500' : 'text-slate-400 hover:bg-navy-800 hover:text-warm-50'}
            `}>
            <item.icon className="mr-3 h-4 w-4" />
            {item.name}
          </NavLink>)}
      </nav>

      <div className="p-4 border-t border-navy-800 space-y-1">
        <a href={import.meta.env.BASE_URL} target="_blank" rel="noopener noreferrer" className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-navy-800 hover:text-warm-50 rounded-lg transition-colors">
          <ExternalLink className="mr-3 h-4 w-4" />
          View Site
        </a>
        <button onClick={handleLogout} className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>;
}