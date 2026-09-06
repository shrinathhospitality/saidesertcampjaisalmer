// Centralized content loading for the public site. Every content type is
// fetched once from the CMS API and falls back to the JSON bundled at build
// time (src/data/*.json) if the API is unreachable, so the site is never
// blank. Fetched fresh on every full page load, so admin edits appear on
// the visitor's next visit/refresh without any extra cache-busting scheme.

import fallbackSettings from '../data/settings.json';
import fallbackHotel from '../data/hotel.json';
import fallbackRooms from '../data/rooms.json';
import fallbackPackages from '../data/packages.json';
import fallbackGallery from '../data/gallery.json';
import fallbackBlogs from '../data/blogs.json';
import fallbackTestimonials from '../data/testimonials.json';
import fallbackAmenities from '../data/amenities.json';
import fallbackFaqs from '../data/faq.json';
import fallbackMenu from '../data/menu.json';
import fallbackSocial from '../data/social.json';

const API_BASE = '/api';

async function fetchType(type) {
  const res = await fetch(`${API_BASE}/content.php?type=${type}`, { credentials: 'omit' });
  if (!res.ok) throw new Error(`Failed to load ${type} (${res.status})`);
  const payload = await res.json();
  if (!payload.ok) throw new Error(payload.error || `Failed to load ${type}`);
  return payload.data;
}

/** siteName/tagline/contact/etc merged onto the shape older components expect from settings.json + hotel.json. */
function normalizeSettings(raw) {
  return {
    ...raw,
    // hotel.json-shaped fields some components/schema read directly.
    name: raw.siteName,
    phone: raw.contact?.phone,
    email: raw.contact?.email,
    address: raw.contact?.address,
    hours: raw.contact?.hours,
    location: raw.contact?.location,
    coordinates: raw.contact?.coordinates,
    mapEmbed: raw.contact?.mapEmbed,
  };
}

export async function loadPublicContent() {
  const fallback = {
    settings: normalizeSettings(fallbackSettings),
    hotel: fallbackHotel,
    navigation: fallbackMenu,
    social: fallbackSocial.map((s) => ({ ...s, enabled: true })),
    pages: [],
    rooms: fallbackRooms.map((r) => ({ ...r, active: r.available })),
    packages: fallbackPackages,
    activities: [],
    gallery: fallbackGallery,
    testimonials: fallbackTestimonials,
    amenities: fallbackAmenities,
    faqs: fallbackFaqs,
    blogs: fallbackBlogs,
  };

  const types = ['site-settings', 'navigation', 'pages', 'packages', 'rooms', 'activities', 'gallery', 'testimonials', 'amenities', 'faqs', 'blogs'];
  const results = await Promise.allSettled(types.map(fetchType));
  const [settingsR, navR, pagesR, packagesR, roomsR, activitiesR, galleryR, testimonialsR, amenitiesR, faqsR, blogsR] = results;

  const settings = settingsR.status === 'fulfilled' ? normalizeSettings(settingsR.value) : fallback.settings;

  return {
    source: results.every((r) => r.status === 'fulfilled') ? 'api' : 'mixed',
    settings,
    hotel: { ...fallback.hotel, ...settings }, // legacy hotel.* accessors resolve to live settings where overlapping
    navigation: navR.status === 'fulfilled' ? navR.value.filter((n) => n.enabled !== false) : fallback.navigation,
    pages: pagesR.status === 'fulfilled' ? pagesR.value : fallback.pages,
    packages: packagesR.status === 'fulfilled' ? packagesR.value.filter((p) => p.active !== false) : fallback.packages,
    rooms: roomsR.status === 'fulfilled' ? roomsR.value.filter((r) => r.active !== false) : fallback.rooms,
    activities: activitiesR.status === 'fulfilled' ? activitiesR.value.filter((a) => a.active !== false) : fallback.activities,
    gallery: galleryR.status === 'fulfilled' ? galleryR.value.filter((g) => g.active !== false) : fallback.gallery,
    testimonials: testimonialsR.status === 'fulfilled' ? testimonialsR.value.filter((t) => t.active !== false) : fallback.testimonials,
    amenities: amenitiesR.status === 'fulfilled' ? amenitiesR.value.filter((a) => a.active !== false) : fallback.amenities,
    faqs: faqsR.status === 'fulfilled' ? faqsR.value.filter((f) => f.active !== false) : fallback.faqs,
    blogs: blogsR.status === 'fulfilled' ? blogsR.value.filter((b) => b.status !== 'draft') : fallback.blogs,
    social: settingsR.status === 'fulfilled' ? (settingsR.value.social || []).filter((s) => s.enabled !== false) : fallback.social,
  };
}

export function getFallbackContent() {
  return {
    settings: normalizeSettings(fallbackSettings),
    hotel: fallbackHotel,
    navigation: fallbackMenu,
    social: fallbackSocial,
    pages: [],
    rooms: fallbackRooms.map((r) => ({ ...r, active: r.available })),
    packages: fallbackPackages,
    activities: [],
    gallery: fallbackGallery,
    testimonials: fallbackTestimonials,
    amenities: fallbackAmenities,
    faqs: fallbackFaqs,
    blogs: fallbackBlogs,
    source: 'fallback',
  };
}
