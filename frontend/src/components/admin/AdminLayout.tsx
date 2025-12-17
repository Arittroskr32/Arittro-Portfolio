import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminSidebar } from './AdminSidebar';
export function AdminLayout() {
  const {
    isAuthenticated,
    loading
  } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-navy-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-500 mx-auto"></div>
        <p className="text-slate-400 mt-4">Loading...</p>
      </div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return <div className="min-h-screen bg-navy-900 flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>;
}