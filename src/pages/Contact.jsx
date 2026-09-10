import { useState } from 'react';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import SectionTitle from '../components/SectionTitle.jsx';
import MapEmbed from '../components/MapEmbed.jsx';
import { useContent } from '../context/ContentContext.jsx';

const EMPTY_FORM = { name: '', email: '', phone: '', inquiryType: 'General', message: '', website: '' };

export default function Contact() {
  const { settings, getPage } = useContent();
  const hero = getPage('/contact')?.hero;
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/enquiries.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sourcePage: '/contact' }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Something went wrong. Please try again.');
      }
      setStatus('sent');
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <Page>
      <SEO title="Contact" description="Contact Sai Desert Camp & Resort for reservations, events, weddings, and guest inquiries." path="/contact" />
      <PageHero
        eyebrow={hero?.eyebrow || 'Contact'}
        title={hero?.title || 'Begin with a conversation'}
        text={hero?.subtitle || 'Reservations, celebrations, meetings, and bespoke journeys can all be shaped by our guest atelier.'}
        image={hero?.image || '/assets/hero-3.svg'}
        breadcrumbs={[{ label: 'Contact' }]}
      />
      <section className="section-pad">
        <div className="container-lux grid gap-10 lg:grid-cols-[1.1fr_.9fr]">
          <form className="rounded-[2rem] border border-ink/10 bg-pearl p-6 shadow-luxury md:p-8" onSubmit={handleSubmit}>
            <SectionTitle eyebrow="Inquiry" title="Tell us what you are imagining" />

            {/* Honeypot: hidden from real visitors, bots that fill every field trip this. */}
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={update('website')}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Field label="Full name" value={form.name} onChange={update('name')} required />
              <Field label="Email" type="email" value={form.email} onChange={update('email')} required />
              <Field label="Phone" value={form.phone} onChange={update('phone')} />
              <Field label="Inquiry type" as="select" value={form.inquiryType} onChange={update('inquiryType')} options={['General', 'Room reservation', 'Wedding', 'Conference', 'Package']} />
              <div className="md:col-span-2"><Field label="Message" as="textarea" value={form.message} onChange={update('message')} required /></div>
            </div>

            {status === 'sent' && <p className="mt-6 rounded-2xl bg-sage/20 px-5 py-4 text-sm font-semibold text-ink">Thank you — your message has been received. Our team will be in touch shortly.</p>}
            {status === 'error' && <p className="mt-6 rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">{error}</p>}

            <button type="submit" disabled={status === 'sending'} className="button-gold mt-6 disabled:opacity-60">
              {status === 'sending' ? 'Sending…' : 'Send Inquiry'}
            </button>
          </form>
          <aside className="grid gap-5">
            <ContactCard icon={FiMapPin} title="Address" text={settings.contact?.address} />
            <ContactCard icon={FiPhone} title="Phone" text={settings.contact?.phone} />
            <ContactCard icon={FiMail} title="Email" text={settings.contact?.email} />
            <div className="rounded-[2rem] border border-ink/10 bg-[#d8ccb8] p-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-[.3em] text-bronze">Business Hours</p>
              <p className="text-ink/68">{settings.contact?.hours}</p>
            </div>
          </aside>
        </div>
      </section>
      <section className="pb-24">
        <div className="container-lux">
          <div className="rounded-[2rem] bg-ink p-8 text-center text-pearl shadow-luxury">
            <MapEmbed
              siteName={settings.siteName}
              address={settings.contact?.address}
              mapLink={settings.contact?.mapLink}
              mapEmbed={settings.contact?.mapEmbed}
              minHeightClass="min-h-[26rem]"
              theme="dark"
            />
          </div>
        </div>
      </section>
    </Page>
  );
}

function Field({ label, type = 'text', as = 'input', options = [], ...props }) {
  const id = label.toLowerCase().replaceAll(' ', '-');
  const cls = 'mt-2 min-h-13 w-full rounded-[1rem] border border-ink/10 bg-white px-4 py-3 outline-none transition focus:border-champagne';
  return (
    <label className="block text-sm font-semibold text-ink/70" htmlFor={id}>
      {label}
      {as === 'textarea' ? <textarea id={id} name={id} className={`${cls} min-h-36`} {...props} /> : as === 'select' ? (
        <select id={id} name={id} className={cls} {...props}>{options.map((item) => <option key={item}>{item}</option>)}</select>
      ) : <input id={id} name={id} type={type} className={cls} {...props} />}
    </label>
  );
}

function ContactCard({ icon: Icon, title, text }) {
  return (
    <article className="rounded-[2rem] border border-ink/10 bg-pearl p-7 shadow-sm">
      <div className="mb-5 grid h-12 w-12 place-items-center rounded-full bg-ink text-champagne"><Icon /></div>
      <h3 className="font-display text-3xl">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-ink/62">{text}</p>
    </article>
  );
}
