import { motion } from 'framer-motion';

export default function SectionTitle({ eyebrow, title, text, align = 'left', light = false }) {
  const centered = align === 'center';
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-90px' }} transition={{ duration: 0.7 }} className={`${centered ? 'mx-auto text-center' : ''} max-w-3xl`}>
      {eyebrow && <p className="mb-4 text-xs font-bold uppercase tracking-[.35em] text-champagne">{eyebrow}</p>}
      <h2 className={`font-display text-5xl font-semibold leading-[.95] md:text-7xl ${light ? 'text-pearl' : 'text-ink'}`}>{title}</h2>
      {text && <p className={`mt-6 text-base leading-8 md:text-lg ${light ? 'text-pearl/68' : 'text-ink/62'}`}>{text}</p>}
    </motion.div>
  );
}
