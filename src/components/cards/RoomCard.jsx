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
        <span className="absolute bottom-5 right-5 rounded-full bg-ink/90 px-4 py-2 text-sm font-bold text-champagne">{formatCurrency(room.price, settings.currency)}{room.priceSuffix ? ` ${room.priceSuffix}` : ' / night'}</span>
      </div>
    </Link>
  );
}
