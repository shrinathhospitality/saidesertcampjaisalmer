import { useState } from 'react';
import { useContent } from '../context/ContentContext.jsx';

export default function Newsletter({ dark = false }) {
  const { settings } = useContent();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  const handleSubmit = async (event) => {
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
    <section className={`rounded-[2rem] border p-6 md:p-8 ${dark ? 'border-pearl/10 bg-pearl/[.04]' : 'border-ink/10 bg-pearl shadow-luxury'}`}>
      <div className="grid items-center gap-6 lg:grid-cols-[1fr_.9fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.35em] text-champagne">Newsletter</p>
          <h2 className={`font-display text-4xl font-semibold md:text-5xl ${dark ? 'text-pearl' : 'text-ink'}`}>{settings.newsletterTitle}</h2>
          <p className={`mt-3 text-sm leading-7 ${dark ? 'text-pearl/62' : 'text-ink/60'}`}>{settings.newsletterText}</p>
          {status === 'sent' && <p className="mt-3 text-sm font-semibold text-sage">You're subscribed. Thank you.</p>}
          {status === 'error' && <p className="mt-3 text-sm font-semibold text-red-400">Something went wrong, please try again.</p>}
        </div>
        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="newsletter-email">Email address</label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className={`min-h-14 flex-1 rounded-full border px-5 outline-none transition focus:border-champagne ${dark ? 'border-pearl/15 bg-ink/60 text-pearl placeholder:text-pearl/35' : 'border-ink/10 bg-white text-ink placeholder:text-ink/35'}`}
          />
          <button className="button-gold disabled:opacity-60" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Subscribe'}</button>
        </form>
      </div>
    </section>
  );
}
