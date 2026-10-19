import { useEffect, useRef, useState } from "react";

export function useParallax(speed = 0.4) {
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setOffset(window.scrollY * speed);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speed]);

  return offset;
}

/** Returns parallax offset + opacity for background and text layers independently.
 *  Background fades faster (fadeBgOver px), text fades slower (fadeTextOver px).
 */
export function useHeroScroll({
  bgSpeed = 0.5,
  textSpeed = 0.18,
  fadeBgOver = 500,
  fadeTextOver = 820,
}: {
  bgSpeed?: number;
  textSpeed?: number;
  fadeBgOver?: number;
  fadeTextOver?: number;
} = {}) {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  return {
    bgOffset:   scrollY * bgSpeed,
    bgOpacity:  clamp(1 - scrollY / fadeBgOver,  0, 1),
    textOffset: scrollY * textSpeed,
    textOpacity: clamp(1 - scrollY / fadeTextOver, 0, 1),
  };
}

export function useScrollReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
