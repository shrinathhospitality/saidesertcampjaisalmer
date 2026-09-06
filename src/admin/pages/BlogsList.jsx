import CollectionListPage from '../components/CollectionListPage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function BlogsList() {
  return (
    <CollectionListPage
      type="blogs"
      title="Blog"
      description="Journal posts shown on the public /blog section."
      searchKeys={['title', 'slug', 'category', 'author']}
      newPath="/admin/blogs/new"
      editPath={(row) => `/admin/blogs/${row.id}`}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'date', label: 'Date' },
        { key: 'featured', label: 'Featured', render: (row) => (row.featured ? 'Yes' : '—') },
        { key: 'status', label: 'Status', render: (row) => <StatusBadge value={row.status} /> },
      ]}
    />
  );
}
