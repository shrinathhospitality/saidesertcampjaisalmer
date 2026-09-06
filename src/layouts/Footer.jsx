import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useContent } from '../context/ContentContext.jsx';
import Newsletter from '../components/Newsletter.jsx';

const iconMap = { instagram: FaInstagram, facebook: FaFacebookF, x: FaXTwitter, linkedin: FaLinkedinIn };

export default function Footer() {
  const { settings, navigation: menu, social } = useContent();
  const footer = settings.footer || {};
  const blocks = footer.blocks || {};

  const copyright = footer.copyrightText?.trim()
    ? footer.copyrightText
    : `© ${new Date().getFullYear()} ${settings.siteName}. All rights reserved.`;

  return (
    <footer className="relative overflow-hidden bg-ink text-pearl">
      <div className="bg-orb -left-40 top-10" />
      <div className="container-lux section-pad">
        {footer.showNewsletter !== false && <Newsletter dark />}
        <div className="gold-divider my-14" />
        <div className="grid gap-10 lg:grid-cols-[1.4fr_.8fr_.8fr_1fr]">
          <div>
            <img src={settings.logo} alt={settings.siteName} width={settings.logoWidth} height={settings.logoHeight} className="h-14 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-7 text-pearl/68">{footer.aboutText}</p>
          </div>
          {blocks.quickLinks !== false && (
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[.3em] text-champagne">Explore</p>
              <div className="grid gap-3 text-sm text-pearl/72">
                {menu.map((item) => <Link key={item.id || item.path} className="hover:text-champagne" to={item.path}>{item.label}</Link>)}
              </div>
            </div>
          )}
          {blocks.legal !== false && (
            <div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[.3em] text-champagne">Legal</p>
              <div className="grid gap-3 text-sm text-pearl/72">
                <Link to="/privacy-policy" className="hover:text-champagne">Privacy Policy</Link>
                <Link to="/terms-conditions" className="hover:text-champagne">Terms &amp; Conditions</Link>
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
            </div>
          )}
        </div>
        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-pearl/10 pt-8 text-xs text-pearl/46 md:flex-row">
          <p>{copyright}</p>
          <p>
            {footer.credit?.text
              ? (footer.credit.url ? <a href={footer.credit.url} className="hover:text-champagne">{footer.credit.text}</a> : footer.credit.text)
              : 'Frontend-only React website powered by local JSON content.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
