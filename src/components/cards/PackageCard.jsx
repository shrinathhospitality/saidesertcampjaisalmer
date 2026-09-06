import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { useContent } from '../../context/ContentContext.jsx';
import { formatCurrency } from '../../utils/format';

export default function PackageCard({ offer }) {
  const { settings } = useContent();
  const link = `/packages/${offer.slug || offer.id}`;
  return (
    <article className="rounded-[2rem] border border-ink/10 bg-pearl shadow-sm transition-shadow duration-300 hover:shadow-luxury">
      <Link to={link} className="block overflow-hidden rounded-t-[2rem]">
        <div className="relative aspect-[16/11]">
          <img src={offer.image} alt={offer.title} loading="lazy" className="h-full w-full object-cover" />
          <span className="absolute left-5 top-5 rounded-full bg-pearl px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-ink">From {formatCurrency(offer.price, settings.currency)}</span>
        </div>
      </Link>
      <div className="p-6">
        <p className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.22em] text-bronze"><FiClock />{offer.duration}</p>
        <Link to={link}><h3 className="font-display text-4xl font-semibold">{offer.title}</h3></Link>
        <p className="mt-3 text-sm leading-7 text-ink/62">{offer.shortDescription}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(offer.highlights || []).slice(0, 3).map((item) => <span key={item} className="rounded-full bg-ink/[.05] px-3 py-1 text-xs text-ink/62">{item}</span>)}
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <Link to="/contact" className="button-gold !min-h-11 !px-5">Inquire</Link>
          <Link to={link} className="luxury-link">Explore <FiArrowRight /></Link>
        </div>
      </div>
    </article>
  );
}
