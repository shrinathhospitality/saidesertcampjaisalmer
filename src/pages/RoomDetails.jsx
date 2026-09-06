import { Link, useParams } from 'react-router-dom';
import { FiCheck, FiStar } from 'react-icons/fi';
import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import ImageSlider from '../components/ImageSlider.jsx';
import RoomCard from '../components/cards/RoomCard.jsx';
import CTA from '../components/CTA.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { bySlug, formatCurrency } from '../utils/format';
import { breadcrumbSchema } from '../seo/schema.js';

export default function RoomDetails() {
  const { slug } = useParams();
  const { rooms, settings } = useContent();
  const room = bySlug(rooms, slug) || rooms[0];
  const related = rooms.filter((item) => item.id !== room.id).slice(0, 3);
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Rooms', url: '/rooms' }, { name: room.title, url: `/rooms/${room.slug}` }];

  return (
    <Page>
      <SEO title={room.title} description={room.shortDescription} path={`/rooms/${room.slug}`} image={room.image} schemas={[breadcrumbSchema(crumbs)]} />
      <PageHero eyebrow="Room Details" title={room.title} text={room.shortDescription} image={room.image} breadcrumbs={[{ label: 'Rooms', path: '/rooms' }, { label: room.title }]} />
      <section className="section-pad">
        <div className="container-lux grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <ImageSlider images={room.gallery} title={room.title} />
            <SectionTitle eyebrow="The Space" title="A detailed private sanctuary" text={room.description} />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <InfoList title="Amenities" items={room.amenities} />
              <InfoList title="Room Features" items={room.features} />
              <InfoList title="Policies" items={room.policies} />
              {room.reviews?.length > 0 && (
                <div className="rounded-[2rem] border border-ink/10 bg-pearl p-6">
                  <h3 className="font-display text-3xl">Guest Reviews</h3>
                  {room.reviews.map((review) => (
                    <blockquote key={review.name} className="mt-4 text-sm leading-7 text-ink/62">
                      <div className="mb-2 flex text-champagne">{Array.from({ length: review.rating }).map((_, i) => <FiStar key={i} />)}</div>
                      &ldquo;{review.text}&rdquo; — {review.name}
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          </div>
          <aside className="h-fit rounded-[2rem] border border-ink/10 bg-pearl p-7 shadow-luxury lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[.28em] text-bronze">From</p>
            <p className="mt-2 font-display text-6xl">{formatCurrency(room.price, settings.currency)}</p>
            <p className="text-ink/50">{room.priceSuffix || 'per night'}</p>
            <div className="my-6 grid gap-3 text-sm">
              <span><strong>Occupancy:</strong> {room.occupancy}</span>
              <span><strong>Bed:</strong> {room.bedType}</span>
              <span><strong>Size:</strong> {room.size}</span>
              <span><strong>Status:</strong> {room.active ? 'Available' : 'Waitlist'}</span>
            </div>
            <Link to="/contact" className="button-gold w-full">{room.ctaLabel || 'Book Now'}</Link>
          </aside>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section-pad bg-[#ede2d0]">
          <div className="container-lux">
            <SectionTitle eyebrow="Related Rooms" title="Other places to stay" align="center" />
            <div className="mt-12 grid gap-6 lg:grid-cols-3">{related.map((item) => <RoomCard key={item.id} room={item} />)}</div>
          </div>
        </section>
      )}
      <section className="section-pad"><div className="container-lux"><CTA title={`Reserve ${room.title}`} /></div></section>
    </Page>
  );
}

function InfoList({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="rounded-[2rem] border border-ink/10 bg-pearl p-6">
      <h3 className="font-display text-3xl">{title}</h3>
      <ul className="mt-4 grid gap-3 text-sm text-ink/64">
        {items.map((item) => <li key={item} className="flex gap-3"><FiCheck className="mt-1 shrink-0 text-bronze" />{item}</li>)}
      </ul>
    </div>
  );
}
