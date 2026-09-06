import { Link } from 'react-router-dom';
import { FiChevronRight } from 'react-icons/fi';

export default function Breadcrumb({ items = [] }) {
  return (
    <nav className="mb-8 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[.2em] text-ink/55" aria-label="Breadcrumb">
      <Link to="/" className="hover:text-bronze">Home</Link>
      {items.map((item, index) => (
        <span className="flex items-center gap-2" key={`${item.label}-${index}`}>
          <FiChevronRight className="text-champagne" />
          {item.path ? <Link to={item.path} className="hover:text-bronze">{item.label}</Link> : <span className="text-ink">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
