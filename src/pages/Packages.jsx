import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import PackageCard from '../components/cards/PackageCard.jsx';
import CTA from '../components/CTA.jsx';
import { useContent } from '../context/ContentContext.jsx';

export default function Packages() {
  const { packages, getPage } = useContent();
  const hero = getPage('/packages')?.hero;

  return (
    <Page>
      <SEO title="Luxury Packages" description="Curated hotel packages for romance, wellness, family travel, and executive retreats." path="/packages" />
      <PageHero
        eyebrow={hero?.eyebrow || 'Packages'}
        title={hero?.title || 'Curated escapes with a sense of occasion'}
        text={hero?.subtitle || 'Each package is managed from the admin dashboard and ready for future booking integrations.'}
        image={hero?.image || '/assets/package-romance.svg'}
        breadcrumbs={[{ label: 'Packages' }]}
      />
      <section className="section-pad">
        <div className="container-lux">
          <SectionTitle eyebrow="Offers" title="Experiences composed around purpose" align="center" />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {packages.map((offer) => <PackageCard key={offer.id} offer={offer} />)}
          </div>
        </div>
      </section>
      <section className="pb-24"><div className="container-lux"><CTA title="Let us tailor your package" /></div></section>
    </Page>
  );
}
