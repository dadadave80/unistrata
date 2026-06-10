import * as React from 'react';

/**
 * Surface container for grouping content. Optional header with eyebrow,
 * title and right-aligned actions; optional tranche accent rail.
 */
export interface PanelProps extends React.HTMLAttributes<HTMLElement> {
  /** Mono uppercase overline above the title. */
  eyebrow?: React.ReactNode;
  /** Panel title. */
  title?: React.ReactNode;
  /** Right-aligned header controls. */
  actions?: React.ReactNode;
  /** Left inset accent rail. */
  accent?: 'senior' | 'junior';
  /** @default "default" */
  variant?: 'default' | 'sunken';
  /** Apply body padding. @default true */
  padded?: boolean;
  /** Suppress the header even if eyebrow/title given. */
  headless?: boolean;
  children?: React.ReactNode;
}

export function Panel(props: PanelProps): JSX.Element;
