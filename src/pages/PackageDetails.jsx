import { Link, useParams } from 'react-router-dom';
import { FiCheck, FiMinus } from 'react-icons/fi';
import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import ImageSlider from '../components/ImageSlider.jsx';
import FAQ from '../components/FAQ.jsx';
import CTA from '../components/CTA.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { bySlug, formatCurrency } from '../utils/format';
import { breadcrumbSchema, faqSchema } from '../seo/schema.js';

export default function PackageDetails() {
  const { slug } = useParams();
  const { packages, settings } = useContent();
  const offer = bySlug(packages, slug) || packages[0];
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Packages', url: '/packages' }, { name: offer.title, url: `/packages/${offer.slug}` }];

  return (
    <Page>
      <SEO title={offer.title} description={offer.shortDescription} path={`/packages/${offer.slug}`} image={offer.image} schemas={[breadcrumbSchema(crumbs), faqSchema(offer.faqs || [])]} />
      <PageHero eyebrow="Package Details" title={offer.title} text={offer.shortDescription} image={offer.image} breadcrumbs={[{ label: 'Packages', path: '/packages' }, { label: offer.title }]} />
      <section className="section-pad">
        <div className="container-lux grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
          <div className="min-w-0">
            <ImageSlider images={offer.gallery} title={offer.title} />
            <SectionTitle eyebrow={offer.duration} title="A curated journey from arrival to farewell" text={offer.description} />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <InfoList title="Inclusions" items={offer.inclusions} icon="check" />
              <InfoList title="Exclusions" items={offer.exclusions} icon="minus" />
            </div>
            {offer.itinerary?.length > 0 && (
              <div className="mt-8 rounded-[2rem] border border-ink/10 bg-pearl p-6">
                <h3 className="font-display text-4xl">Itinerary</h3>
                <ol className="mt-6 grid gap-4">
                  {offer.itinerary.map((item, index) => (
                    <li key={item} className="grid grid-cols-[3rem_1fr] gap-4">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-ink font-display text-2xl text-champagne">{index + 1}</span>
                      <p className="pt-3 text-ink/64">{item}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            {offer.faqs?.length > 0 && (
              <div className="mt-8">
                <SectionTitle eyebrow="Questions" title="Package FAQ" />
                <div className="mt-6"><FAQ items={offer.faqs} /></div>
              </div>
            )}
          </div>
          <aside className="h-fit rounded-[2rem] border border-ink/10 bg-pearl p-7 shadow-luxury lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[.28em] text-bronze">Starting from</p>
            <p className="mt-2 font-display text-6xl">{formatCurrency(offer.price, settings.currency)}</p>
            <p className="text-ink/50">{offer.duration}</p>
            <div className="my-6 flex flex-wrap gap-2">
              {(offer.highlights || []).map((item) => <span key={item} className="rounded-full bg-ink/[.05] px-3 py-1 text-xs text-ink/62">{item}</span>)}
            </div>
            <Link to="/contact" className="button-gold w-full">{offer.ctaLabel || 'Inquire Now'}</Link>
          </aside>
        </div>
      </section>
      <section className="pb-24"><div className="container-lux"><CTA title={`Plan ${offer.title}`} /></div></section>
    </Page>
  );
}

function InfoList({ title, items, icon }) {
  if (!items?.length) return null;
  const Icon = icon === 'minus' ? FiMinus : FiCheck;
  return (
    <div className="rounded-[2rem] border border-ink/10 bg-pearl p-6">
      <h3 className="font-display text-3xl">{title}</h3>
      <ul className="mt-4 grid gap-3 text-sm text-ink/64">
        {items.map((item) => <li key={item} className="flex gap-3"><Icon className="mt-1 shrink-0 text-bronze" />{item}</li>)}
      </ul>
    </div>
  );
}
