import { motion, AnimatePresence } from 'framer-motion';
import settings from '../data/settings.json';

export default function Loader({ visible = true }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-ink text-pearl" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55 }}>
          <div className="text-center">
            <motion.div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-full border border-champagne/40 font-display text-4xl text-champagne" animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}>L</motion.div>
            <p className="font-display text-4xl">{settings.siteName}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[.45em] text-champagne/80">Preparing your stay</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
