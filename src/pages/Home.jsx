import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import Hero from '../components/home/Hero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import RoomCard from '../components/cards/RoomCard.jsx';
import PackageCard from '../components/cards/PackageCard.jsx';
import BlogCard from '../components/cards/BlogCard.jsx';
import GalleryGrid from '../components/GalleryGrid.jsx';
import TestimonialSlider from '../components/TestimonialSlider.jsx';
import FAQ from '../components/FAQ.jsx';
import CTA from '../components/CTA.jsx';
import AmenityIcon from '../components/AmenityIcon.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { faqSchema } from '../seo/schema.js';

const DEFAULT_WELCOME_IMAGE = { image: '/assets/hero-2.svg', captionTitle: 'Quiet grandeur', captionText: 'Architecture, ritual, and service arranged around privacy.' };

export default function Home() {
  const { hotel, settings, rooms, packages, amenities, gallery, testimonials, faqs, blogs, getPage } = useContent();
  // CMS-managed content (editable at /admin/pages/page-home) takes priority;
  // falls back to the bundled copy if the API is unreachable or has none yet.
  const homePage = getPage('/');
  const welcomeImage = homePage?.welcomeImage?.image ? homePage.welcomeImage : DEFAULT_WELCOME_IMAGE;
  const experiences = homePage?.experiences?.length ? homePage.experiences : hotel.experiences;
  const attractions = homePage?.attractions?.length ? homePage.attractions : hotel.attractions;
  const featuredRooms = rooms.filter((room) => room.featured).slice(0, 3);
  const featuredPackages = packages.filter((offer) => offer.featured).slice(0, 2);
  return (
    <Page>
      <SEO title="Private 5-Star Luxury Resort" description={hotel.longDescription} schemas={[faqSchema(faqs)]} />
      <Hero />

      <section className="section-pad relative overflow-hidden">
        <div className="bg-orb right-0 top-20" />
        <div className="container-lux grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative">
            <img src={welcomeImage.image} alt={welcomeImage.captionTitle || 'Welcome'} className="rounded-[2rem] shadow-luxury" />
            <div className="glass-dark absolute -bottom-8 right-6 max-w-xs rounded-[1.5rem] p-5 text-pearl">
              <p className="font-display text-4xl text-champagne">{welcomeImage.captionTitle}</p>
              <p className="mt-2 text-sm leading-6 text-pearl/70">{welcomeImage.captionText}</p>
            </div>
          </div>
          <div>
            <SectionTitle eyebrow="Welcome" title="A hotel designed like a private estate" text={hotel.longDescription} />
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {(hotel.stats || []).map((stat) => (
                <div key={stat.label} className="rounded-[1.5rem] border border-ink/10 bg-pearl p-5 shadow-sm transition-shadow duration-300 hover:shadow-luxury">
                  <p className="font-display text-5xl text-bronze">{stat.value}{stat.suffix}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-[.22em] text-ink/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-ink text-pearl">
        <div className="container-lux">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionTitle eyebrow="Suites & Villas" title="Rooms with atmosphere, privacy, and generous space" light />
            <Link to="/rooms" className="button-ghost">All Rooms <FiArrowRight /></Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {featuredRooms.map((room) => <RoomCard key={room.id} room={room} />)}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-lux">
          <SectionTitle eyebrow="Curated Escapes" title="Packages for romance, recovery, family, and business" align="center" />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {featuredPackages.map((offer) => <PackageCard key={offer.id} offer={offer} />)}
          </div>
        </div>
      </section>

      <section className="section-pad relative overflow-hidden bg-[#ede2d0]">
        <div className="container-lux">
          <SectionTitle eyebrow="Estate Amenities" title="Everything is composed around ease" align="center" />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity) => (
              <article key={amenity.id || amenity.title} className="rounded-[2rem] border border-ink/10 bg-pearl p-7 shadow-sm transition-shadow duration-300 hover:shadow-luxury">
                <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-ink text-xl text-champagne"><AmenityIcon name={amenity.icon} /></div>
                <h3 className="font-display text-3xl font-semibold">{amenity.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink/62">{amenity.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-lux grid gap-5 lg:grid-cols-5">
          {(experiences || []).map((item, index) => (
            <article key={item.title} className={`card-lift group relative min-h-[28rem] overflow-hidden rounded-[2rem] ${index === 0 || index === 4 ? 'lg:col-span-2' : ''}`}>
              <img src={item.image} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent" />
              <div className="absolute bottom-0 p-7 text-pearl">
                <p className="mb-2 text-xs font-bold uppercase tracking-[.25em] text-champagne">Experience</p>
                <h3 className="font-display text-4xl font-semibold">{item.title}</h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-pearl/70">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad bg-ink text-pearl">
        <div className="container-lux grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <SectionTitle eyebrow="Nearby Attractions" title="A destination with culture, coastline, and calm" text="The concierge team can arrange private guides, sunrise walks, cultural access, yacht charters, artisan studio visits, and family-friendly discovery." light />
          <div className="grid gap-5">
            {(attractions || []).map((item) => (
              <article key={item.title} className="grid grid-cols-[9rem_1fr] items-center gap-5 rounded-[1.6rem] border border-pearl/10 bg-pearl/[.04] p-3">
                <img src={item.image} alt={item.title} className="h-28 w-36 rounded-[1.2rem] object-cover" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.28em] text-champagne">{item.distance} away</p>
                  <h3 className="mt-2 font-display text-3xl">{item.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-lux">
          <SectionTitle eyebrow="Gallery Preview" title="A visual tour of the estate" align="center" />
          <div className="mt-12"><GalleryGrid items={gallery.slice(0, 6)} /></div>
        </div>
      </section>

      <section className="section-pad bg-ink text-pearl">
        <div className="container-lux">
          <SectionTitle eyebrow="Guest Notes" title="The quiet details guests remember" align="center" light />
          <div className="mt-12"><TestimonialSlider testimonials={testimonials} /></div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-lux grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <SectionTitle eyebrow="FAQ" title="Before you arrive" text="Policies and practical information, kept up to date from the admin dashboard." />
          <FAQ items={faqs} />
        </div>
      </section>

      <section className="section-pad bg-[#ede2d0]">
        <div className="container-lux">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionTitle eyebrow="Journal" title="Latest stories from the estate" />
            <Link to="/blog" className="button-ghost !text-ink hover:!text-ink">All Articles</Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {blogs.slice(0, 3).map((post) => <BlogCard key={post.id} post={post} />)}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-lux grid gap-10 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-ink p-8 text-pearl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.35em] text-champagne">Instagram</p>
            <h2 className="font-display text-5xl">Moments from @saidesertcampresort</h2>
            <p className="mt-4 text-pearl/62">Replace social links and feed behavior later. This frontend keeps the layout ready without an external API.</p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {gallery.slice(0, 6).map((item) => <img key={item.id} src={item.src} alt={item.title} className="aspect-square rounded-2xl object-cover" loading="lazy" />)}
            </div>
          </div>
          <div className="rounded-[2rem] border border-ink/10 bg-pearl p-8 shadow-luxury">
            <p className="mb-4 text-xs font-bold uppercase tracking-[.35em] text-bronze">Google Maps</p>
            <div className="grid min-h-[26rem] place-items-center rounded-[1.5rem] bg-[#d8ccb8] p-8 text-center">
              <div>
                <p className="font-display text-5xl">Map Placeholder</p>
                <p className="mt-4 max-w-md text-sm leading-7 text-ink/60">{settings.contact?.mapEmbed}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="container-lux"><CTA /></div>
      </section>
    </Page>
  );
}
