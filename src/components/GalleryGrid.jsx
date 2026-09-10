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
      <LightGallery speed={500} plugins={[lgZoom]} elementClassNames="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((item) => (
          <a key={item.id} href={item.src} className="card-lift group relative block aspect-[4/5] overflow-hidden rounded-[1.4rem] bg-ink/5 shadow-sm" data-sub-html={`<h4>${item.title}</h4>`}>
            <img src={item.src} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110" />
            <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
            {item.type === 'video' && (
              <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-pearl/90 text-ink shadow-lg transition-transform duration-500 group-hover:scale-110">
                <FiPlay />
              </span>
            )}
            <span className="absolute inset-x-0 bottom-0 translate-y-1 p-5 text-pearl transition-transform duration-500 group-hover:translate-y-0">
              <span className="block text-[.65rem] font-bold uppercase tracking-[.28em] text-champagne">{item.category}</span>
              <span className="mt-1 block font-display text-2xl font-semibold leading-tight">{item.title}</span>
            </span>
          </a>
        ))}
      </LightGallery>
    </div>
  );
}
