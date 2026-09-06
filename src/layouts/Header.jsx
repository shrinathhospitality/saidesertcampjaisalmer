import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiSearch, FiX } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { useContent } from '../context/ContentContext.jsx';

const iconMap = { instagram: FaInstagram, facebook: FaFacebookF, x: FaXTwitter, linkedin: FaLinkedinIn };

export default function Header() {
  const { navigation: menu, social, settings } = useContent();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const announcement = settings.header?.announcement;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${scrolled ? 'bg-ink shadow-xl shadow-black/10' : 'bg-transparent'}`}>
      {announcement?.enabled && announcement.text && (
        <div className="bg-champagne px-4 py-2 text-center text-xs font-semibold uppercase tracking-[.2em] text-ink">
          {announcement.link ? <a href={announcement.link}>{announcement.text}</a> : announcement.text}
        </div>
      )}
      <div className="container-lux flex h-20 items-center justify-between text-pearl">
        <Link to="/" className="group flex items-center gap-3" aria-label={`${settings.logoText || settings.siteName} home`}>
          <img
            src={settings.logo}
            alt={settings.logoText || settings.siteName}
            width={settings.logoWidth}
            height={settings.logoHeight}
            className="h-10 w-auto sm:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {menu.map((item) => (
            <div className="group relative" key={item.id || item.label}>
              <NavLink
                to={item.path}
                className={({ isActive }) => `rounded-full px-4 py-3 text-sm font-semibold transition ${isActive ? 'text-champagne' : 'text-pearl/86 hover:text-champagne'}`}
              >
                {item.label}
              </NavLink>
              {item.children?.length > 0 && (
                <div className="invisible absolute left-1/2 top-full w-[34rem] -translate-x-1/2 translate-y-4 rounded-[2rem] border border-pearl/10 bg-obsidian p-4 opacity-0 shadow-luxury transition-all duration-300 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100">
                  <div className="grid grid-cols-3 gap-3">
                    {item.children.filter((c) => c.enabled !== false).map((child) => (
                      <Link key={child.id || child.path} to={child.path} className="rounded-[1.35rem] border border-pearl/10 bg-pearl/[.05] p-4 transition hover:border-champagne/60 hover:bg-champagne/10">
                        <span className="block font-display text-xl text-pearl">{child.label}</span>
                        <span className="mt-2 block text-xs leading-5 text-pearl/62">{child.description}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <button className="grid h-10 w-10 place-items-center rounded-full border border-pearl/15 text-pearl/85 transition hover:border-champagne hover:text-champagne" aria-label="Search">
            <FiSearch />
          </button>
          <div className="flex items-center gap-2">
            {social.slice(0, 3).map((item) => {
              const Icon = iconMap[item.icon];
              return Icon ? (
                <a key={item.name} href={item.url} aria-label={item.name} className="grid h-9 w-9 place-items-center rounded-full text-pearl/70 transition hover:bg-pearl/10 hover:text-champagne">
                  <Icon />
                </a>
              ) : null;
            })}
          </div>
          <Link className="button-gold" to="/contact">{settings.bookNowLabel}</Link>
        </div>

        <button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-full border border-pearl/20 text-2xl lg:hidden" aria-label="Open menu">
          <FiMenu />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 bg-ink text-pearl lg:hidden" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <div className="container-lux flex h-20 items-center justify-between">
              <img src={settings.logo} alt={settings.logoText || settings.siteName} width={settings.logoWidth} height={settings.logoHeight} className="h-10 w-auto" />
              <button onClick={() => setOpen(false)} className="grid h-11 w-11 place-items-center rounded-full border border-pearl/20 text-2xl" aria-label="Close menu"><FiX /></button>
            </div>
            <nav className="container-lux mt-8 grid gap-4">
              {menu.map((item) => (
                <Link key={item.id || item.path} to={item.path} onClick={() => setOpen(false)} className="border-b border-pearl/10 py-4 font-display text-4xl">
                  {item.label}
                </Link>
              ))}
              <Link to="/contact" onClick={() => setOpen(false)} className="button-gold mt-8 w-full">{settings.bookNowLabel}</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
