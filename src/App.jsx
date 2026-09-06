import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PublicSite from './sites/PublicSite.jsx';
import Loader from './components/Loader.jsx';

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'));

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Loader visible />}>
            <AdminApp />
          </Suspense>
        }
      />
      <Route path="/*" element={<PublicSite />} />
    </Routes>
  );
}
