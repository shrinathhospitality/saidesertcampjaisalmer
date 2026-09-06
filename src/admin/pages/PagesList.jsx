import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiExternalLink } from 'react-icons/fi';
import { contentApi } from '../services/content.js';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import DataTable from '../components/DataTable.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function PagesList() {
  const [pages, setPages] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    contentApi.list('pages').then((items) => setPages([...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))));
  }, []);

  if (!pages) return <LoadingSpinner label="Loading pages…" />;

  return (
    <div>
      <PageHeader title="Pages" description="Edit the hero text and SEO metadata for each existing page. Page layouts and URLs stay as built." />
      <DataTable
        columns={[
          { key: 'name', label: 'Page' },
          { key: 'path', label: 'URL', render: (row) => <code className="text-xs text-slate-500">{row.path}</code> },
          { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        ]}
        rows={pages}
        searchKeys={['name', 'path']}
        rowActions={(row) => (
          <div className="flex justify-end gap-2">
            <a href={row.path} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="View page">
              <FiExternalLink />
            </a>
            <button onClick={() => navigate(`/admin/pages/${row.id}`)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="Edit">
              <FiEdit2 />
            </button>
          </div>
        )}
      />
    </div>
  );
}
