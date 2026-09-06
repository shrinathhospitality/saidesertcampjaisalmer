import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import AppRoutes from '../routes/AppRoutes.jsx';
import Header from '../layouts/Header.jsx';
import Footer from '../layouts/Footer.jsx';
import Loader from '../components/Loader.jsx';
import ScrollProgress from '../components/ScrollProgress.jsx';
import BackToTop from '../components/BackToTop.jsx';
import { useLoader } from '../hooks/useLoader.js';
import { useSmoothScroll } from '../hooks/useSmoothScroll.js';
import { ContentProvider } from '../context/ContentContext.jsx';

export default function PublicSite() {
  const location = useLocation();
  const loading = useLoader();
  useSmoothScroll();

  return (
    <ContentProvider>
      <Loader visible={loading} />
      <ScrollProgress />
      <Header />
      <AnimatePresence mode="wait">
        <AppRoutes key={location.pathname} />
      </AnimatePresence>
      <Footer />
      <BackToTop />
    </ContentProvider>
  );
}
