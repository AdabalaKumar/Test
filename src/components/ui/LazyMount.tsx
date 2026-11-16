'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mounts children only while the wrapper is near the viewport. Each WebGL scene holds a GPU context,
 * so pages with several viewers keep just the visible one alive.
 */
export default function LazyMount({ children, className = '', margin = '300px', placeholder = null }: { children: React.ReactNode; className?: string; margin?: string; placeholder?: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return <div ref={ref} className={className}>{visible ? children : placeholder}</div>;
}
