import { useEffect, useState } from 'react';
import { FiArrowUp } from 'react-icons/fi';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <button
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={`fixed bottom-6 right-6 z-30 grid h-12 w-12 place-items-center rounded-full border border-champagne/50 bg-ink text-champagne shadow-glow transition ${visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0 pointer-events-none'}`}
    >
      <FiArrowUp />
    </button>
  );
}
