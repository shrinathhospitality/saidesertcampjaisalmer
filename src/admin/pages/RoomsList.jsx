import CollectionListPage from '../components/CollectionListPage.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function RoomsList() {
  return (
    <CollectionListPage
      type="rooms"
      title="Rooms"
      description="Rooms, suites, villas, and residences."
      searchKeys={['title', 'slug']}
      newPath="/admin/rooms/new"
      editPath={(row) => `/admin/rooms/${row.id}`}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'occupancy', label: 'Occupancy' },
        { key: 'price', label: 'Price', render: (row) => `${row.price}${row.priceSuffix ? ` ${row.priceSuffix}` : ''}` },
        { key: 'featured', label: 'Featured', render: (row) => (row.featured ? 'Yes' : '—') },
        { key: 'active', label: 'Status', render: (row) => <StatusBadge value={row.active ? 'active' : 'inactive'} /> },
      ]}
    />
  );
}
