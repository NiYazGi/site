import { useEffect, useRef, useState } from 'react';

/** Animate a number counting up from 0 to `value`. */
export function useCountUp(value: number, duration = 800): number {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    fromRef.current = from;
    const start = performance.now();

    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        prevRef.current = value;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}
