import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import CTA from '../components/CTA.jsx';
import AmenityIcon from '../components/AmenityIcon.jsx';
import { useContent } from '../context/ContentContext.jsx';

export default function About() {
  const { hotel, amenities, getPage } = useContent();
  const page = getPage('/about');
  const hero = page?.hero;

  return (
    <Page>
      <SEO title="About Us" description={hotel.longDescription} path="/about" />
      <PageHero
        eyebrow={hero?.eyebrow || 'About Us'}
        title={hero?.title || 'Hospitality with restraint, theatre, and soul'}
        text={hero?.subtitle || hotel.description}
        image={hero?.image || '/assets/hero-2.svg'}
        breadcrumbs={[{ label: 'About Us' }]}
      />
      <section className="section-pad">
        <div className="container-lux grid items-center gap-12 lg:grid-cols-2">
          <SectionTitle eyebrow="Philosophy" title="Every gesture is intentional" text={hotel.longDescription} />
          <div className="grid gap-4 sm:grid-cols-2">
            {(hotel.stats || []).map((stat) => (
              <div key={stat.label} className="rounded-[1.5rem] border border-ink/10 bg-pearl p-6 shadow-sm">
                <p className="font-display text-5xl text-bronze">{stat.value}{stat.suffix}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-[.22em] text-ink/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-pad bg-ink text-pearl">
        <div className="container-lux">
          <SectionTitle eyebrow="Signature Services" title="The invisible architecture of ease" align="center" light />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {amenities.map((amenity) => (
              <article key={amenity.id || amenity.title} className="rounded-[2rem] border border-pearl/10 bg-pearl/[.04] p-7">
                <div className="mb-6 grid h-14 w-14 place-items-center rounded-full bg-champagne text-xl text-ink"><AmenityIcon name={amenity.icon} /></div>
                <h3 className="font-display text-3xl">{amenity.title}</h3>
                <p className="mt-3 text-sm leading-7 text-pearl/62">{amenity.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section-pad"><div className="container-lux"><CTA title="Let us shape your stay" /></div></section>
    </Page>
  );
}
