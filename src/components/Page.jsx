import { motion } from 'framer-motion';
import { pageVariants } from '../animations/pageTransitions';

export default function Page({ children, className = '' }) {
  return (
    <motion.main className={className} variants={pageVariants} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.main>
  );
}
