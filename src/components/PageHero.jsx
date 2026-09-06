import Breadcrumb from './Breadcrumb.jsx';

export default function PageHero({ eyebrow, title, text, image = '/assets/hero-1.svg', breadcrumbs = [] }) {
  return (
    <section className="relative overflow-hidden bg-ink pt-32 text-pearl">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" />
      <div className="container-lux relative z-10 py-20 md:py-28">
        <div className="text-pearl [&_nav]:text-pearl/60 [&_span.text-ink]:text-pearl">
          <Breadcrumb items={breadcrumbs} />
        </div>
        {eyebrow && <p className="mb-5 text-xs font-bold uppercase tracking-[.45em] text-champagne">{eyebrow}</p>}
        <h1 className="max-w-5xl font-display text-6xl font-semibold leading-[.9] md:text-8xl">{title}</h1>
        {text && <p className="mt-7 max-w-2xl text-lg leading-8 text-pearl/72">{text}</p>}
      </div>
    </section>
  );
}
