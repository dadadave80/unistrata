import * as React from 'react';

/**
 * Compact status / metadata label. Tranche-tinted variants, plus a
 * pulsing "live" dot for things the Reactive Network drives autonomously.
 */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "neutral" */
  variant?: 'neutral' | 'senior' | 'junior' | 'positive' | 'negative' | 'live';
  /** @default "md" */
  size?: 'sm' | 'md';
  /** Show a leading status dot. */
  dot?: boolean;
  /** Show a pulsing live dot (implies dot). */
  live?: boolean;
  children?: React.ReactNode;
}

export function Badge(props: BadgeProps): JSX.Element;
