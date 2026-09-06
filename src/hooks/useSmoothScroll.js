import { useEffect } from 'react';

export function useSmoothScroll() {
  useEffect(() => {
    const anchors = Array.from(document.querySelectorAll('a[href^="#"]'));
    const handleClick = (event) => {
      const id = event.currentTarget.getAttribute('href');
      const target = id && document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    anchors.forEach((anchor) => anchor.addEventListener('click', handleClick));
    return () => anchors.forEach((anchor) => anchor.removeEventListener('click', handleClick));
  }, []);
}
