import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiExternalLink, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import SidebarNav from './SidebarNav.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useSiteSettings } from '../hooks/useSiteSettings.js';
import { useToast } from '../hooks/useToast.jsx';

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const settings = useSiteSettings();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out');
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <NavLink to="/admin" className="flex h-20 items-center gap-2 border-b border-slate-100 px-5">
          <img src={settings.logo} alt={settings.logoText || settings.siteName} className="h-9 w-auto" />
        </NavLink>
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-5">
              <img src={settings.logo} alt={settings.logoText || settings.siteName} className="h-9 w-auto" />
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
                <FiX />
              </button>
            </div>
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" className="grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden">
            <FiMenu />
          </button>
          <div className="hidden text-sm text-slate-500 lg:block">
            Signed in as <span className="font-medium text-slate-700">{user?.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <FiExternalLink /> <span className="hidden sm:inline">Preview site</span>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <FiLogOut /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
