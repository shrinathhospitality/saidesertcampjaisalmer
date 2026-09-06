import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import GalleryGrid from '../components/GalleryGrid.jsx';
import CTA from '../components/CTA.jsx';
import { useContent } from '../context/ContentContext.jsx';

export default function Gallery() {
  const { gallery, getPage } = useContent();
  const hero = getPage('/gallery')?.hero;

  return (
    <Page>
      <SEO title="Gallery" description="Explore the resort's rooms, pool, spa, dining, weddings, and event spaces." path="/gallery" />
      <PageHero
        eyebrow={hero?.eyebrow || 'Gallery'}
        title={hero?.title || 'A cinematic view of the estate'}
        text={hero?.subtitle || 'Filter images and open the premium lightbox gallery.'}
        image={hero?.image || '/assets/gallery-8.svg'}
        breadcrumbs={[{ label: 'Gallery' }]}
      />
      <section className="section-pad">
        <div className="container-lux">
          <SectionTitle eyebrow="Visual Tour" title="Architecture, dining, wellness, events, and golden-hour moments" align="center" />
          <div className="mt-12"><GalleryGrid items={gallery} /></div>
        </div>
      </section>
      <section className="pb-24"><div className="container-lux"><CTA title="Step inside the story" /></div></section>
    </Page>
  );
}
