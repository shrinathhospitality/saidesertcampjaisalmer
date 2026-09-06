import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import './styles/index.css';
import App from './App.jsx';
import Loader from './components/Loader.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <App />
        </Suspense>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
