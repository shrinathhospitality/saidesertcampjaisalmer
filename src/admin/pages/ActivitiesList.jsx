import CollectionListPage from '../components/CollectionListPage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function ActivitiesList() {
  return (
    <CollectionListPage
      type="activities"
      title="Activities"
      description="Bookable guest experiences and excursions."
      searchKeys={['title', 'slug']}
      newPath="/admin/activities/new"
      editPath={(row) => `/admin/activities/${row.id}`}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'duration', label: 'Duration' },
        { key: 'price', label: 'Price', render: (row) => (row.price ? `${row.price}${row.priceSuffix ? ` ${row.priceSuffix}` : ''}` : '—') },
        { key: 'featured', label: 'Featured', render: (row) => (row.featured ? 'Yes' : '—') },
        { key: 'active', label: 'Status', render: (row) => <StatusBadge value={row.active ? 'active' : 'inactive'} /> },
      ]}
    />
  );
}
