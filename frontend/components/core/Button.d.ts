import * as React from 'react';

/**
 * Primary action control. Solid bone-white for the one true CTA;
 * tranche-tinted variants for senior/junior deposit actions.
 *
 * @startingPoint section="Core" subtitle="Buttons — all variants & sizes" viewport="700x200"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual role. @default "secondary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'senior' | 'junior' | 'danger';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** Leading icon node (e.g. a Lucide <i data-lucide>). */
  icon?: React.ReactNode;
  /** Trailing icon node. */
  iconRight?: React.ReactNode;
  /** Stretch to container width. */
  fullWidth?: boolean;
  /** Render as another element/tag (e.g. "a"). @default "button" */
  as?: keyof JSX.IntrinsicElements;
  children?: React.ReactNode;
}

export function Button(props: ButtonProps): JSX.Element;
