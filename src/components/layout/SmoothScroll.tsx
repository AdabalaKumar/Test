'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/** Inertial page scrolling. Elements marked data-lenis-prevent (3D viewers, modals) keep native wheel behaviour. */
export default function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    let raf = requestAnimationFrame(function loop(time) { lenis.raf(time); raf = requestAnimationFrame(loop); });
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
