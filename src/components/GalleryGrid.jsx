import { useMemo, useState } from 'react';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import { FiPlay } from 'react-icons/fi';
import { getCategories } from '../utils/format';

export default function GalleryGrid({ items }) {
  const [category, setCategory] = useState('All');
  const categories = useMemo(() => getCategories(items), [items]);
  const visible = category === 'All' ? items : items.filter((item) => item.category === category);

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-3">
        {categories.map((item) => (
          <button key={item} onClick={() => setCategory(item)} className={`rounded-full border px-5 py-2 text-xs font-bold uppercase tracking-[.18em] transition ${category === item ? 'border-champagne bg-champagne text-ink' : 'border-ink/10 text-ink/60 hover:border-bronze'}`}>{item}</button>
        ))}
      </div>
      <LightGallery speed={500} plugins={[lgZoom]} elementClassNames="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <a key={item.id} href={item.src} className={`group relative min-h-[18rem] overflow-hidden rounded-[1.6rem] ${item.span || ''}`} data-sub-html={`<h4>${item.title}</h4>`}>
            <img src={item.src} alt={item.title} loading="lazy" className="h-full min-h-[18rem] w-full object-cover transition duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-80" />
            {item.type === 'video' && <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-pearl/90 text-ink"><FiPlay /></span>}
            <span className="absolute bottom-5 left-5 text-pearl">
              <span className="block text-xs font-bold uppercase tracking-[.25em] text-champagne">{item.category}</span>
              <span className="font-display text-3xl font-semibold">{item.title}</span>
            </span>
          </a>
        ))}
      </LightGallery>
    </div>
  );
}
