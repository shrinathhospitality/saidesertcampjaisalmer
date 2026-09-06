import CollectionListPage from '../components/CollectionListPage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function PackagesList() {
  return (
    <CollectionListPage
      type="packages"
      title="Packages"
      description="Curated multi-night offers and experiences."
      searchKeys={['title', 'slug']}
      newPath="/admin/packages/new"
      editPath={(row) => `/admin/packages/${row.id}`}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'duration', label: 'Duration' },
        { key: 'price', label: 'Price', render: (row) => `${row.price}${row.priceSuffix ? ` ${row.priceSuffix}` : ''}` },
        { key: 'featured', label: 'Featured', render: (row) => (row.featured ? 'Yes' : '—') },
        { key: 'active', label: 'Status', render: (row) => <StatusBadge value={row.active ? 'active' : 'inactive'} /> },
      ]}
    />
  );
}
