import { useEffect, useMemo, useState } from 'react';
import { FiDownload, FiEye, FiTrash2 } from 'react-icons/fi';
import { enquiriesApi } from '../services/enquiries.js';
import { useToast } from '../hooks/useToast.jsx';
import PageHeader from '../components/PageHeader.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import DataTable from '../components/DataTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { SelectField, TextAreaField } from '../components/FormField.jsx';

const STATUSES = ['New', 'Contacted', 'Confirmed', 'Closed'];

export default function EnquiriesList() {
  const [items, setItems] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const toast = useToast();

  const load = () => enquiriesApi.list().then(setItems).catch((err) => toast.error(err.message));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    return statusFilter === 'all' ? items : items.filter((i) => i.status === statusFilter);
  }, [items, statusFilter]);

  if (!items) return <LoadingSpinner label="Loading enquiries…" />;

  const handleDelete = async () => {
    try {
      await enquiriesApi.remove(pendingDelete.id);
      toast.success('Enquiry deleted');
      setPendingDelete(null);
      setSelected(null);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <PageHeader
        title="Enquiries"
        description="Website contact and booking enquiries."
        actions={
          <>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <a href={enquiriesApi.exportUrl()} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <FiDownload /> Export CSV
            </a>
          </>
        }
      />

      {filtered.length === 0 ? (
        <EmptyState title="No enquiries" message="Submissions from the website's contact and enquiry forms will appear here." />
      ) : (
        <DataTable
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'inquiryType', label: 'Type' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'createdAt', label: 'Received', render: (row) => new Date(row.createdAt).toLocaleDateString() },
          ]}
          rows={filtered}
          searchKeys={['name', 'email', 'message']}
          rowActions={(row) => (
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelected(row)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50" title="View"><FiEye /></button>
              <button onClick={() => setPendingDelete(row)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50" title="Delete"><FiTrash2 /></button>
            </div>
          )}
        />
      )}

      {selected && (
        <EnquiryDetailModal
          enquiry={selected}
          onClose={() => setSelected(null)}
          onSaved={() => { load(); }}
          onDelete={() => setPendingDelete(selected)}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this enquiry?"
        message={`The enquiry from "${pendingDelete?.name}" will be permanently deleted.`}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function EnquiryDetailModal({ enquiry, onClose, onSaved, onDelete }) {
  const [status, setStatus] = useState(enquiry.status);
  const [notes, setNotes] = useState(enquiry.notes || '');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await enquiriesApi.update(enquiry.id, { status, notes });
      toast.success('Enquiry updated');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{enquiry.name}</h3>
          <p className="text-sm text-slate-500">{enquiry.email} {enquiry.phone && `· ${enquiry.phone}`}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{enquiry.message}</div>
        <p className="text-xs text-slate-400">
          {enquiry.inquiryType} · Submitted {new Date(enquiry.createdAt).toLocaleString()}
          {enquiry.sourcePage && ` · from ${enquiry.sourcePage}`}
        </p>
        <SelectField label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUSES.map((s) => ({ value: s, label: s }))} />
        <TextAreaField label="Admin notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex justify-between pt-2">
          <button onClick={onDelete} className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><FiTrash2 /> Delete</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Close</button>
            <button onClick={handleSave} disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
