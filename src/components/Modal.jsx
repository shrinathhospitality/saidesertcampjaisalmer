import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

export default function Modal({ open, onClose, children, label = 'Dialog' }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div role="dialog" aria-modal="true" aria-label={label} className="fixed inset-0 z-50 grid place-items-center bg-ink/92 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[2rem] bg-pearl p-6 shadow-luxury" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }}>
            <button onClick={onClose} className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-ink text-pearl" aria-label="Close"><FiX /></button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
