import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import { useContent } from '../context/ContentContext.jsx';

export default function PrivacyPolicy() {
  const { getPage } = useContent();
  const hero = getPage('/privacy-policy')?.hero;
  return (
    <Page>
      <SEO title="Privacy Policy" description="Privacy policy placeholder for Sai Desert Camp & Resort." path="/privacy-policy" />
      <PageHero
        eyebrow={hero?.eyebrow || 'Legal'}
        title={hero?.title || 'Privacy Policy'}
        text={hero?.subtitle || 'Replace this editable legal content with jurisdiction-specific policy language before launch.'}
        image={hero?.image || '/assets/hero-1.svg'}
        breadcrumbs={[{ label: 'Privacy Policy' }]}
      />
      <section className="section-pad">
        <div className="container-lux max-w-4xl rounded-[2rem] border border-ink/10 bg-pearl p-8 text-ink/68 shadow-sm">
          {['Information We Collect', 'How We Use Information', 'Cookies and Analytics', 'Data Retention', 'Guest Rights', 'Contact'].map((title) => (
            <section key={title} className="mb-8">
              <h2 className="font-display text-4xl text-ink">{title}</h2>
              <p className="mt-3 leading-8">This frontend template stores no submitted data by default. Forms are UI placeholders until connected to an approved booking, CRM, or CMS provider. Update this section in source content before production launch.</p>
            </section>
          ))}
        </div>
      </section>
    </Page>
  );
}
