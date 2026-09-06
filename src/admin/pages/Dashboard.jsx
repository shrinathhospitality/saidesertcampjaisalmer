import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBox, FiEdit3, FiExternalLink, FiFileText, FiGrid, FiImage, FiInbox, FiPlus,
} from 'react-icons/fi';
import { contentApi } from '../services/content.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const STAT_CARDS = [
  { type: 'pages', label: 'Pages', icon: FiFileText },
  { type: 'packages', label: 'Packages', icon: FiBox },
  { type: 'rooms', label: 'Rooms', icon: FiGrid },
  { type: 'blogs', label: 'Blog Posts', icon: FiEdit3 },
  { type: 'gallery', label: 'Gallery Images', icon: FiImage },
  { type: 'enquiries', label: 'Enquiries', icon: FiInbox },
];

export default function Dashboard() {
  const [counts, setCounts] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [recentContent, setRecentContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [pages, packages, rooms, blogs, gallery, enquiriesList] = await Promise.all([
          contentApi.list('pages'), contentApi.list('packages'), contentApi.list('rooms'),
          contentApi.list('blogs'), contentApi.list('gallery'), contentApi.list('enquiries'),
        ]);
        if (!active) return;
        setCounts({
          pages: pages.length, packages: packages.length, rooms: rooms.length,
          blogs: blogs.length, gallery: gallery.length, enquiries: enquiriesList.length,
        });
        setEnquiries(enquiriesList.slice(0, 5));

        const edited = [
          ...packages.map((p) => ({ ...p, kind: 'Package' })),
          ...rooms.map((p) => ({ ...p, kind: 'Room' })),
          ...blogs.map((p) => ({ ...p, kind: 'Blog' })),
        ].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)).slice(0, 6);
        setRecentContent(edited);
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard…" />;
  if (error) return <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">Could not load dashboard: {error}</p>;

  const newEnquiries = enquiries.filter((e) => e.status === 'New').length;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="An overview of your website content and recent activity."
        actions={
          <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <FiExternalLink /> View website
          </a>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {STAT_CARDS.map((card) => (
          <div key={card.type} className="rounded-2xl border border-slate-200 bg-white p-4">
            <card.icon className="mb-2 text-lg text-slate-400" />
            <p className="text-2xl font-semibold text-slate-900">{counts?.[card.type] ?? 0}</p>
            <p className="text-xs text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          <QuickAction to="/admin/packages/new" label="New Package" />
          <QuickAction to="/admin/blogs/new" label="New Blog Post" />
          <QuickAction to="/admin/media" label="Upload Media" />
          <QuickAction to="/admin/enquiries" label={`Enquiries${newEnquiries ? ` (${newEnquiries} new)` : ''}`} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Recent enquiries</p>
            <Link to="/admin/enquiries" className="text-xs font-medium text-slate-500 hover:text-slate-800">View all</Link>
          </div>
          {enquiries.length === 0 ? (
            <p className="text-sm text-slate-400">No enquiries yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {enquiries.map((enquiry) => (
                <li key={enquiry.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{enquiry.name}</p>
                    <p className="text-xs text-slate-400">{enquiry.email}</p>
                  </div>
                  <StatusBadge value={enquiry.status} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">Recently edited content</p>
          {recentContent.length === 0 ? (
            <p className="text-sm text-slate-400">Nothing edited yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentContent.map((item) => (
                <li key={`${item.kind}-${item.id}`} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{item.title || item.name}</p>
                    <p className="text-xs text-slate-400">{item.kind}</p>
                  </div>
                  <span className="text-xs text-slate-400">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ to, label }) {
  return (
    <Link to={to} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
      <FiPlus className="text-slate-400" /> {label}
    </Link>
  );
}
