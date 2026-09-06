import { Link } from 'react-router-dom';
import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';

export default function NotFound() {
  return (
    <Page>
      <SEO title="Page Not Found" description="The requested page could not be found." path="/404" />
      <section className="relative grid min-h-screen place-items-center overflow-hidden bg-ink px-4 text-center text-pearl">
        <img src="/assets/hero-3.svg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 bg-ink/70" />
        <div className="relative z-10">
          <p className="font-display text-[11rem] font-semibold leading-none text-champagne md:text-[16rem]">404</p>
          <h1 className="font-display text-5xl md:text-7xl">A quiet corridor with no door</h1>
          <p className="mx-auto mt-5 max-w-xl text-pearl/68">The page you requested has moved or does not exist. Return to the estate entrance.</p>
          <Link to="/" className="button-gold mt-8">Return Home</Link>
        </div>
      </section>
    </Page>
  );
}
