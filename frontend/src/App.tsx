import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AuthProvider } from './contexts/AuthContext';
import { AdminLayout } from './components/admin/AdminLayout';
// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Skills } from './pages/Skills';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { CTFBugBounty } from './pages/CTFBugBounty';
import { CTFDetail } from './pages/CTFDetail';
import { BugBountyDetail } from './pages/BugBountyDetail';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { Contact } from './pages/Contact';
import { Certificates } from './pages/Certificates';
import { CertificateDetail } from './pages/CertificateDetail';
// Admin Pages
import { AdminLogin } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import ManageProjects from './pages/admin/ManageProjects';
import ManageBlog from './pages/admin/ManageBlog';
import { BlogEditor } from './pages/admin/BlogEditor';
import ManageSkills from './pages/admin/ManageSkills';
import ManageCertificates from './pages/admin/ManageCertificates';
import ManageCTF from './pages/admin/ManageCTF';
import ManageBugBounty from './pages/admin/ManageBugBounty';
import ManageCVEs from './pages/admin/ManageCVEs';
import ContactMessages from './pages/admin/ContactMessages';
import ProfileEditor from './pages/admin/ProfileEditor';
import Settings from './pages/admin/Settings';
function AnimatedRoutes() {
  const location = useLocation();
  return <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/" element={<Layout>
              <Home />
            </Layout>} />
        <Route path="/about" element={<Layout>
              <About />
            </Layout>} />
        <Route path="/skills" element={<Layout>
              <Skills />
            </Layout>} />
        <Route path="/projects" element={<Layout>
              <Projects />
            </Layout>} />
        <Route path="/projects/:id" element={<Layout>
              <ProjectDetail />
            </Layout>} />
        <Route path="/ctf-bug-bounty" element={<Layout>
              <CTFBugBounty />
            </Layout>} />
        <Route path="/ctf/:id" element={<Layout>
              <CTFDetail />
            </Layout>} />
        <Route path="/bug-bounty/:id" element={<Layout>
              <BugBountyDetail />
            </Layout>} />
        <Route path="/blog" element={<Layout>
              <Blog />
            </Layout>} />
        <Route path="/blog/:id" element={<Layout>
              <BlogPost />
            </Layout>} />
        <Route path="/certificate" element={<Layout>
              <Certificates />
            </Layout>} />
        <Route path="/certificate/:id" element={<Layout>
              <CertificateDetail />
            </Layout>} />
        <Route path="/contact" element={<Layout>
              <Contact />
            </Layout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<ManageProjects />} />
          <Route path="blog" element={<ManageBlog />} />
          <Route path="blog/new" element={<BlogEditor />} />
          <Route path="blog/edit/:id" element={<BlogEditor />} />
          <Route path="skills" element={<ManageSkills />} />
          <Route path="certificate" element={<ManageCertificates />} />
          <Route path="ctf" element={<ManageCTF />} />
          <Route path="cves" element={<ManageCVEs />} />
          <Route path="bug-bounty" element={<ManageBugBounty />} />
          <Route path="messages" element={<ContactMessages />} />
          <Route path="profile" element={<ProfileEditor />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Unknown URLs go home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>;
}
export function App() {
  return <AuthProvider>
      <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <AnimatedRoutes />
      </Router>
    </AuthProvider>;
}