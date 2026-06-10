'use client';

import React from 'react';

type FormatOptions = {
  decimals?: number;
  prefix?: string;
  suffix?: string;
  commas?: boolean;
};

function format(n: number, { decimals = 0, prefix = '', suffix = '', commas = true }: FormatOptions) {
  const fixed = Number(n).toFixed(decimals);
  if (!commas) return prefix + fixed + suffix;
  const [int, frac] = fixed.split('.');
  const withC = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return prefix + withC + (frac ? '.' + frac : '') + suffix;
}

type NumberTickerProps = Omit<React.HTMLAttributes<HTMLSpanElement>, 'prefix'> & {
  /** The target value. */
  value?: number;
  /** Decimal places. @default 0 */
  decimals?: number;
  /** Leading string, e.g. "$". */
  prefix?: string;
  /** Trailing string, e.g. "%". */
  suffix?: string;
  /** Group thousands with commas. @default true */
  commas?: boolean;
  /** Override tick duration (ms). Defaults to --dur-tick. */
  duration?: number;
};

/**
 * Animates from its previous value to the new one on change.
 * Numbers tick — they never fade.
 */
export function NumberTicker({
  value = 0, decimals = 0, prefix = '', suffix = '', commas = true,
  duration, className = '', style, ...rest
}: NumberTickerProps) {
  const [display, setDisplay] = React.useState(value);
  const fromRef = React.useRef(value);
  const rafRef = React.useRef(0);
  const settleRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const startRef = React.useRef(0);

  const dur = duration ?? (() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--dur-tick');
    const ms = parseFloat(v); return Number.isFinite(ms) ? ms : 520;
  });

  React.useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const D = typeof dur === 'function' ? dur() : dur;
    const from = fromRef.current;
    const to = value;
    if (reduce || D <= 1 || from === to) { setDisplay(to); fromRef.current = to; return; }
    cancelAnimationFrame(rafRef.current);
    clearTimeout(settleRef.current);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startRef.current) / D);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    // Guaranteed settle: if rAF is paused (background tab, capture), still land on `to`.
    settleRef.current = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      setDisplay(to); fromRef.current = to;
    }, D + 80);
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(settleRef.current); };
  }, [value]); // eslint-disable-line

  return (
    <span
      className={`st-ticker ${className}`}
      style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums lining-nums', fontFeatureSettings: 'var(--data-feature-settings)', ...style }}
      {...rest}
    >
      {format(display, { decimals, prefix, suffix, commas })}
    </span>
  );
}
