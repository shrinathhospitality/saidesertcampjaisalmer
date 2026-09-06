import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { ToastProvider } from './hooks/useToast.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ComingSoon from './pages/ComingSoon.jsx';

const SiteSettings = lazy(() => import('./pages/SiteSettings.jsx'));
const HeaderSettings = lazy(() => import('./pages/HeaderSettings.jsx'));
const FooterSettings = lazy(() => import('./pages/FooterSettings.jsx'));
const PagesList = lazy(() => import('./pages/PagesList.jsx'));
const PageEditor = lazy(() => import('./pages/PageEditor.jsx'));
const SeoDefaults = lazy(() => import('./pages/SeoDefaults.jsx'));
const PackagesList = lazy(() => import('./pages/PackagesList.jsx'));
const PackageEditor = lazy(() => import('./pages/PackageEditor.jsx'));
const RoomsList = lazy(() => import('./pages/RoomsList.jsx'));
const RoomEditor = lazy(() => import('./pages/RoomEditor.jsx'));
const ActivitiesList = lazy(() => import('./pages/ActivitiesList.jsx'));
const ActivityEditor = lazy(() => import('./pages/ActivityEditor.jsx'));
const GalleryManager = lazy(() => import('./pages/GalleryManager.jsx'));
const TestimonialsManager = lazy(() => import('./pages/TestimonialsManager.jsx'));
const FaqsManager = lazy(() => import('./pages/FaqsManager.jsx'));
const BlogsList = lazy(() => import('./pages/BlogsList.jsx'));
const BlogEditor = lazy(() => import('./pages/BlogEditor.jsx'));
const EnquiriesList = lazy(() => import('./pages/EnquiriesList.jsx'));
const MediaLibrary = lazy(() => import('./pages/MediaLibrary.jsx'));
const Backups = lazy(() => import('./pages/Backups.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));

function Page({ children }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="login" element={<Login />} />
          <Route
            path=""
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="site-settings" element={<Page><SiteSettings /></Page>} />
            <Route path="header" element={<Page><HeaderSettings /></Page>} />
            <Route path="footer" element={<Page><FooterSettings /></Page>} />
            <Route path="pages" element={<Page><PagesList /></Page>} />
            <Route path="pages/:id" element={<Page><PageEditor /></Page>} />
            <Route path="seo" element={<Page><SeoDefaults /></Page>} />
            <Route path="packages" element={<Page><PackagesList /></Page>} />
            <Route path="packages/new" element={<Page><PackageEditor /></Page>} />
            <Route path="packages/:id" element={<Page><PackageEditor /></Page>} />
            <Route path="rooms" element={<Page><RoomsList /></Page>} />
            <Route path="rooms/new" element={<Page><RoomEditor /></Page>} />
            <Route path="rooms/:id" element={<Page><RoomEditor /></Page>} />
            <Route path="activities" element={<Page><ActivitiesList /></Page>} />
            <Route path="activities/new" element={<Page><ActivityEditor /></Page>} />
            <Route path="activities/:id" element={<Page><ActivityEditor /></Page>} />
            <Route path="gallery" element={<Page><GalleryManager /></Page>} />
            <Route path="testimonials" element={<Page><TestimonialsManager /></Page>} />
            <Route path="faqs" element={<Page><FaqsManager /></Page>} />
            <Route path="blogs" element={<Page><BlogsList /></Page>} />
            <Route path="blogs/new" element={<Page><BlogEditor /></Page>} />
            <Route path="blogs/:id" element={<Page><BlogEditor /></Page>} />
            <Route path="enquiries" element={<Page><EnquiriesList /></Page>} />
            <Route path="media" element={<Page><MediaLibrary /></Page>} />
            <Route path="backups" element={<Page><Backups /></Page>} />
            <Route path="profile" element={<Page><Profile /></Page>} />
            <Route path="*" element={<ComingSoon title="Not found" />} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
