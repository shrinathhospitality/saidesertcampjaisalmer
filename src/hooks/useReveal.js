import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-reveal]',
        { y: options.y ?? 38, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: options.duration ?? 1,
          ease: 'power3.out',
          stagger: options.stagger ?? 0.09,
          scrollTrigger: { trigger: ref.current, start: 'top 78%' }
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [options.duration, options.stagger, options.y]);
  return ref;
}
