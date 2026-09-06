import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import RoomCard from '../components/cards/RoomCard.jsx';
import CTA from '../components/CTA.jsx';
import { useContent } from '../context/ContentContext.jsx';

export default function Rooms() {
  const { rooms, getPage } = useContent();
  const hero = getPage('/rooms')?.hero;

  return (
    <Page>
      <SEO title="Rooms, Suites & Villas" description="Explore luxury rooms, suites, villas, and private residences." path="/rooms" />
      <PageHero
        eyebrow={hero?.eyebrow || 'Rooms'}
        title={hero?.title || 'Suites and villas with private rhythm'}
        text={hero?.subtitle || 'Choose from refined rooms, garden sanctuaries, pool villas, terrace suites, and residential retreats.'}
        image={hero?.image || '/assets/room-villa.svg'}
        breadcrumbs={[{ label: 'Rooms' }]}
      />
      <section className="section-pad">
        <div className="container-lux">
          <SectionTitle eyebrow="Accommodation" title="Every category, managed from the admin dashboard" align="center" />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {rooms.map((room) => <RoomCard key={room.id} room={room} />)}
          </div>
        </div>
      </section>
      <section className="pb-24"><div className="container-lux"><CTA title="Reserve a room that fits your journey" /></div></section>
    </Page>
  );
}
