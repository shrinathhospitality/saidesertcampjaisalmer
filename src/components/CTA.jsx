import { Link } from 'react-router-dom';

export default function CTA({ title = 'Begin your private escape', text = 'Our reservations team can curate rooms, dining, wellness, events, and celebrations around your preferences.', label = 'Plan Your Stay' }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-pearl shadow-luxury md:p-12">
      <div className="bg-orb -right-28 -top-28" />
      <div className="relative z-10 grid items-center gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.35em] text-champagne">Reservation Atelier</p>
          <h2 className="font-display text-5xl font-semibold md:text-7xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-pearl/68">{text}</p>
        </div>
        <Link to="/contact" className="button-gold">{label}</Link>
      </div>
    </section>
  );
}
