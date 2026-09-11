import { FiCheck, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useContent } from '../../context/ContentContext.jsx';
import { formatCurrency } from '../../utils/format';

export default function RoomCategoryCard({ room, index }) {
  const { settings } = useContent();
  const reversed = index % 2 === 1;
  const gallery = (room.gallery?.length ? room.gallery : [room.image]).filter(Boolean);
  const thumbs = gallery.slice(1, 4);
  const inclusions = [...(room.amenities || []), ...(room.features || [])];
  const whatsappNumber = (settings.contact?.whatsapp || '').replace(/[^\d]/g, '');
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(room.whatsappMessage || `Hello, I would like to enquire about the ${room.title}.`)}`
    : null;

  return (
    <article className="grid gap-10 rounded-[2rem] border border-ink/10 bg-pearl p-6 shadow-sm md:p-8 lg:grid-cols-2 lg:items-start">
      <div className={reversed ? 'lg:order-2' : ''}>
        <span className="inline-block rounded-full border border-bronze/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[.2em] text-bronze">
          Category {toRoman(index + 1)}
        </span>
        <h3 className="mt-4 font-display text-4xl font-semibold">{room.title}</h3>
        <p className="mt-3 text-sm leading-7 text-ink/64">{room.description || room.shortDescription}</p>

        <div className="mt-7 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Spec label="Occupancy" value={room.occupancy} />
          <Spec label="Bed Configuration" value={room.bedType} />
          <Spec label="Room Size" value={room.size} />
          <Spec label="Status" value={room.active ? 'Available' : 'Waitlist'} />
        </div>

        {inclusions.length > 0 && (
          <div className="mt-7">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.28em] text-bronze">Inclusions</p>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm text-ink/68 sm:grid-cols-2">
              {inclusions.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <FiCheck className="mt-1 shrink-0 text-bronze" /> {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <p className="font-display text-3xl text-ink">
            {formatCurrency(room.price, settings.currency)}
            <span className="ml-1 text-sm font-sans text-ink/50">{room.priceSuffix || '/ night'}</span>
          </p>
          {whatsappHref && (
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="button-gold">
              <FaWhatsapp /> Enquire on WhatsApp
            </a>
          )}
          {settings.contact?.phone && (
            <a href={`tel:${settings.contact.phone}`} className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[.16em] text-bronze hover:text-ink">
              <FiPhone /> Call to Book
            </a>
          )}
        </div>
        <Link to={`/rooms/${room.slug || room.id}`} className="mt-4 inline-block text-sm font-semibold text-ink/50 underline hover:text-ink">
          View full details
        </Link>
      </div>

      <div className={reversed ? 'lg:order-1' : ''}>
        <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem]">
          <img src={room.image} alt={room.title} loading="lazy" className="h-full w-full object-cover" />
        </div>
        {thumbs.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {thumbs.map((src) => (
              <div key={src} className="aspect-square overflow-hidden rounded-[1rem]">
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function Spec({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[.65rem] font-bold uppercase tracking-[.2em] text-ink/40">{label}</p>
      <p className="mt-1 font-semibold text-ink/80">{value}</p>
    </div>
  );
}

function toRoman(num) {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  return romans[num - 1] || String(num);
}
