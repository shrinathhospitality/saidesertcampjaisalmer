import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const Home = lazy(() => import('../pages/Home.jsx'));
const About = lazy(() => import('../pages/About.jsx'));
const Rooms = lazy(() => import('../pages/Rooms.jsx'));
const RoomDetails = lazy(() => import('../pages/RoomDetails.jsx'));
const Packages = lazy(() => import('../pages/Packages.jsx'));
const PackageDetails = lazy(() => import('../pages/PackageDetails.jsx'));
const Gallery = lazy(() => import('../pages/Gallery.jsx'));
const Blog = lazy(() => import('../pages/Blog.jsx'));
const BlogDetails = lazy(() => import('../pages/BlogDetails.jsx'));
const Contact = lazy(() => import('../pages/Contact.jsx'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy.jsx'));
const TermsConditions = lazy(() => import('../pages/TermsConditions.jsx'));
const NotFound = lazy(() => import('../pages/NotFound.jsx'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/rooms" element={<Rooms />} />
      <Route path="/rooms/:slug" element={<RoomDetails />} />
      <Route path="/packages" element={<Packages />} />
      <Route path="/packages/:slug" element={<PackageDetails />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogDetails />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
