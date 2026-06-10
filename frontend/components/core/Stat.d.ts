import * as React from 'react';

/**
 * A single data readout: mono eyebrow label, large tabular value with
 * optional unit, and an optional directional delta. Numbers are the
 * protagonists — this is the workhorse for every metric.
 */
export interface StatProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Mono uppercase label. */
  label?: React.ReactNode;
  /** The number (pass a NumberTicker for animated values). */
  value: React.ReactNode;
  /** Small trailing unit, e.g. "APR" or "/day". */
  unit?: React.ReactNode;
  /** Secondary change readout. */
  delta?: React.ReactNode;
  /** @default "flat" */
  deltaDir?: 'up' | 'down' | 'flat';
  /** Tints the value with a tranche color. @default "default" */
  tone?: 'default' | 'senior' | 'junior';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children?: React.ReactNode;
}

export function Stat(props: StatProps): JSX.Element;
