import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
interface LayoutProps {
  children: React.ReactNode;
}
export function Layout({
  children
}: LayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  // If admin, we don't use this layout wrapper (AdminLayout handles it)
  if (isAdmin) return <>{children}</>;
  return <div className="min-h-screen bg-navy-900 text-warm-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-navy-800 bg-navy-900/80 backdrop-blur-md sticky top-0 z-30">
          <span className="font-bold text-lg">ARITTRO.SEC</span>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-white">
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 lg:p-12 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>;
}