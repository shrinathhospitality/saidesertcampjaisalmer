import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useContent } from '../context/ContentContext.jsx';
import { CamelCaravanSilhouette, FortSkylineOutline } from '../components/DesertIllustrations.jsx';

const iconMap = { instagram: FaInstagram, facebook: FaFacebookF, x: FaXTwitter, linkedin: FaLinkedinIn };

export default function Footer() {
  const { settings, navigation: menu, social } = useContent();
  const footer = settings.footer || {};
  const blocks = footer.blocks || {};
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const copyright = footer.copyrightText?.trim()
    ? footer.copyrightText
    : `© ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.`;

  const whatsappNumber = (settings.contact?.whatsapp || '').replace(/[^\d]/g, '');
  const experienceLinks = footer.experienceLinks?.length
    ? footer.experienceLinks
    : [
        { label: 'Luxury Tents', path: '/rooms' },
        { label: 'Desert Safari', path: '/packages' },
        { label: 'Cultural Evening', path: '/packages' },
        { label: 'Dining', path: '/about' },
      ];

  const handleSubscribe = async (event) => {
    event.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/enquiries.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: email.split('@')[0] || 'Newsletter subscriber',
          email,
          message: 'Newsletter signup',
          inquiryType: 'Newsletter',
          sourcePage: window.location.pathname,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.ok) throw new Error();
      setStatus('sent');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <footer className="relative overflow-hidden bg-ink text-pearl">
      {footer.showNewsletter !== false && (
        <div className="relative overflow-hidden border-b border-pearl/10">
          {footer.newsletterBackgroundImage && (
            <img src={footer.newsletterBackgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/40" />
          <div className="container-lux relative flex flex-col gap-8 py-14 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="mb-3 flex items-center gap-3 text-xs font-bold uppercase tracking-[.32em] text-champagne">
                {footer.newsletterEyebrow || 'Stay Closer to Extraordinary'} <span className="h-px w-10 bg-champagne/60" />
              </p>
              <h2 className="font-display text-4xl font-semibold md:text-5xl">{settings.newsletterTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-pearl/72">{settings.newsletterText}</p>
              {status === 'sent' && <p className="mt-3 text-sm font-semibold text-sage">You're subscribed. Thank you.</p>}
              {status === 'error' && <p className="mt-3 text-sm font-semibold text-red-400">Something went wrong, please try again.</p>}
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="footer-newsletter-email">Email address</label>
                <input
                  id="footer-newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="min-h-14 flex-1 rounded-full border border-pearl/15 bg-ink/60 px-5 text-pearl outline-none transition placeholder:text-pearl/35 focus:border-champagne sm:w-64"
                />
                <button className="button-gold whitespace-nowrap disabled:opacity-60" type="submit" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Subscribe'}
                </button>
              </form>
              <span className="hidden h-10 w-px bg-pearl/20 sm:block" />
              <Link to="/contact" className="button-ghost whitespace-nowrap">Book Your Stay</Link>
            </div>
          </div>
          <p className="pointer-events-none absolute bottom-3 right-6 hidden font-script text-3xl text-champagne/90 lg:block">
            {footer.scriptTagline || 'Jaisalmer Awaits'}
          </p>
        </div>
      )}

      <div className="bg-orb -left-40 top-10" />
      <div className="container-lux section-pad">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_.7fr_.8fr_1fr]">
          <div>
            <img src={settings.logo} alt={settings.siteName} width={settings.logoWidth} height={settings.logoHeight} className="h-14 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-pearl/68">{footer.aboutText}</p>
            <div className="gold-divider my-6 max-w-[10rem]" />
            <p className="text-xs font-bold uppercase tracking-[.3em] text-champagne/80">{footer.tagline || 'Desert People Stories Forever'}</p>
            <CamelCaravanSilhouette className="mt-6 h-9 w-auto text-champagne/60" />
          </div>
          {blocks.quickLinks !== false && (
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[.3em] text-champagne">Explore</p>
              <div className="grid gap-3 text-sm text-pearl/72">
                {menu.map((item) => <Link key={item.id || item.path} className="hover:text-champagne" to={item.path}>{item.label}</Link>)}
              </div>
            </div>
          )}
          {blocks.experiences !== false && experienceLinks.length > 0 && (
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[.3em] text-champagne">Experiences</p>
              <div className="grid gap-3 text-sm text-pearl/72">
                {experienceLinks.map((item) => <Link key={item.label} className="hover:text-champagne" to={item.path}>{item.label}</Link>)}
              </div>
            </div>
          )}
          {blocks.contact !== false && (
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[.3em] text-champagne">Contact</p>
              <div className="grid gap-3 text-sm leading-6 text-pearl/72">
                <span>{settings.contact?.address}</span>
                <a className="hover:text-champagne" href={`tel:${settings.contact?.phone}`}>{settings.contact?.phone}</a>
                <a className="hover:text-champagne" href={`mailto:${settings.contact?.email}`}>{settings.contact?.email}</a>
              </div>
              {blocks.social !== false && (
                <div className="mt-6 flex gap-3">
                  {social.map((item) => {
                    const Icon = iconMap[item.icon];
                    return Icon ? <a key={item.name} href={item.url} aria-label={item.name} className="grid h-10 w-10 place-items-center rounded-full border border-pearl/15 text-pearl/70 transition hover:border-champagne hover:text-champagne"><Icon /></a> : null;
                  })}
                </div>
              )}
              {whatsappNumber && (
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-champagne/50 px-5 py-2.5 text-xs font-bold uppercase tracking-[.18em] text-champagne transition hover:bg-champagne hover:text-ink"
                >
                  <FaWhatsapp /> WhatsApp Enquiry
                </a>
              )}
            </div>
          )}
        </div>

        <div className="mt-14 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-pearl/15" />
          <span className="flex items-center gap-2 text-champagne/80">
            <span className="text-[.5rem]">◇</span>
            <span className="text-sm">◆</span>
            <span className="text-[.5rem]">◇</span>
          </span>
          <span className="h-px flex-1 bg-pearl/15" />
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-5 text-xs text-pearl/46 lg:flex-row">
          <p>
            {copyright} |{' '}
            <Link to="/privacy-policy" className="text-champagne underline decoration-champagne/40 underline-offset-2 hover:text-pearl">Privacy Policy</Link>
            {' | '}
            <Link to="/terms-conditions" className="text-champagne underline decoration-champagne/40 underline-offset-2 hover:text-pearl">Terms &amp; Conditions</Link>
          </p>
          <p>
            Created by{' '}
            {footer.credit?.url ? (
              <a href={footer.credit.url} target="_blank" rel="noopener noreferrer" className="font-bold text-champagne hover:text-pearl">{footer.credit?.text || 'Shrinath Solutions'}</a>
            ) : (
              <span className="font-bold text-champagne">{footer.credit?.text || 'Shrinath Solutions'}</span>
            )}
          </p>
          <div className="hidden items-center gap-3 lg:flex">
            <FortSkylineOutline className="h-9 w-28 text-champagne/45" />
            <p className="text-[.6rem] font-bold uppercase leading-tight tracking-[.2em] text-pearl/45">
              More than a stay<br />a feeling
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
