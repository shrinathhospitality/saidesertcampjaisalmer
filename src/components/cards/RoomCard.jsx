import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext.jsx';
import { formatCurrency } from '../../utils/format';

export default function RoomCard({ room }) {
  const { settings } = useContent();
  return (
    <Link to={`/rooms/${room.slug || room.id}`} className="block overflow-hidden rounded-[2rem] border border-ink/10 shadow-sm transition-shadow duration-300 hover:shadow-luxury">
      <div className="relative aspect-[4/3]">
        <img src={room.image} alt={room.title} loading="lazy" className="h-full w-full object-cover" />
        <span className={`absolute left-5 top-5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[.18em] ${room.active ? 'bg-sage text-pearl' : 'bg-ink text-pearl'}`}>
          {room.active ? 'Available' : 'Waitlist'}
        </span>
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 pt-10">
          <span className="block font-display text-2xl font-semibold text-pearl">{room.title}</span>
          <span className="mt-1 block text-sm font-bold text-champagne">{formatCurrency(room.price, settings.currency)}{room.priceSuffix ? ` ${room.priceSuffix}` : ' / night'}</span>
        </span>
      </div>
    </Link>
  );
}
