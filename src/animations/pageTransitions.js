export const pageVariants = {
  initial: { opacity: 0, y: 18 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -18, transition: { duration: 0.35, ease: 'easeInOut' } }
};

export const stagger = {
  enter: { transition: { staggerChildren: 0.08 } }
};

export const itemReveal = {
  initial: { opacity: 0, y: 28 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
};
