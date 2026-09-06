import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import { useContent } from '../context/ContentContext.jsx';

export default function TermsConditions() {
  const { getPage } = useContent();
  const hero = getPage('/terms-conditions')?.hero;
  return (
    <Page>
      <SEO title="Terms & Conditions" description="Terms and conditions placeholder for Sai Desert Camp & Resort." path="/terms-conditions" />
      <PageHero
        eyebrow={hero?.eyebrow || 'Legal'}
        title={hero?.title || 'Terms & Conditions'}
        text={hero?.subtitle || 'Reservation terms, cancellation rules, and guest policies should be reviewed by counsel before launch.'}
        image={hero?.image || '/assets/hero-2.svg'}
        breadcrumbs={[{ label: 'Terms & Conditions' }]}
      />
      <section className="section-pad">
        <div className="container-lux max-w-4xl rounded-[2rem] border border-ink/10 bg-pearl p-8 text-ink/68 shadow-sm">
          {['Reservations', 'Rates and Taxes', 'Cancellation', 'Guest Conduct', 'Events', 'Liability'].map((title) => (
            <section key={title} className="mb-8">
              <h2 className="font-display text-4xl text-ink">{title}</h2>
              <p className="mt-3 leading-8">This is placeholder legal copy for the frontend template. Replace with official hotel terms, booking policies, payment rules, and local regulatory requirements before going live.</p>
            </section>
          ))}
        </div>
      </section>
    </Page>
  );
}
