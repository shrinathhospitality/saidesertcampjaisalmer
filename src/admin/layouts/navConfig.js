import {
  FiActivity, FiBox, FiCamera, FiEdit3, FiFileText, FiGrid, FiHelpCircle,
  FiHome, FiImage, FiInbox, FiLayout, FiMessageSquare, FiSearch, FiSettings,
  FiUser, FiDatabase, FiLayers,
} from 'react-icons/fi';

export const NAV_SECTIONS = [
  {
    items: [{ label: 'Dashboard', path: '/admin', icon: FiHome, end: true }],
  },
  {
    title: 'Site',
    items: [
      { label: 'Site Settings', path: '/admin/site-settings', icon: FiSettings },
      { label: 'Header', path: '/admin/header', icon: FiLayout },
      { label: 'Footer', path: '/admin/footer', icon: FiLayers },
      { label: 'Pages', path: '/admin/pages', icon: FiFileText },
      { label: 'SEO', path: '/admin/seo', icon: FiSearch },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Packages', path: '/admin/packages', icon: FiBox },
      { label: 'Rooms', path: '/admin/rooms', icon: FiGrid },
      { label: 'Activities', path: '/admin/activities', icon: FiActivity },
      { label: 'Gallery', path: '/admin/gallery', icon: FiImage },
      { label: 'Testimonials', path: '/admin/testimonials', icon: FiMessageSquare },
      { label: 'FAQs', path: '/admin/faqs', icon: FiHelpCircle },
      { label: 'Blog', path: '/admin/blogs', icon: FiEdit3 },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Enquiries', path: '/admin/enquiries', icon: FiInbox },
      { label: 'Media Library', path: '/admin/media', icon: FiCamera },
      { label: 'Backups', path: '/admin/backups', icon: FiDatabase },
      { label: 'Profile', path: '/admin/profile', icon: FiUser },
    ],
  },
];
