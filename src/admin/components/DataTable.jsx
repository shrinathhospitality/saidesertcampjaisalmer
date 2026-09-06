import { useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';

const PAGE_SIZE = 10;

export default function DataTable({ columns, rows, searchKeys = [], rowActions, emptyMessage = 'No records found.' }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!query.trim() || searchKeys.length === 0) return rows;
    const q = query.trim().toLowerCase();
    return rows.filter((row) => searchKeys.some((key) => String(row[key] ?? '').toLowerCase().includes(q)));
  }, [rows, query, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  return (
    <div>
      {searchKeys.length > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 sm:w-80">
          <FiSearch className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search…"
            className="w-full text-sm outline-none"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3">{col.label}</th>
              ))}
              {rowActions && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-4 py-10 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {pageRows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/60">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 align-middle text-slate-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {rowActions && <td className="px-4 py-3 text-right">{rowActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>Page {pageSafe} of {totalPages} ({filtered.length} total)</span>
          <div className="flex gap-2">
            <button
              disabled={pageSafe <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={pageSafe >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
