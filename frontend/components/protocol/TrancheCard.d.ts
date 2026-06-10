import * as React from 'react';

type TrancheRow = { label: React.ReactNode; value: React.ReactNode; tone?: 'senior' | 'junior' };

/**
 * A selectable deposit card for one tranche. Senior reads calm and dense;
 * junior reads warm and alive — the same instrument in two temperaments,
 * expressed through restrained contrast (never green/red).
 *
 * @startingPoint section="Protocol" subtitle="Senior / junior deposit cards" viewport="720x440"
 */
export interface TrancheCardProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'role'> {
  /** Which layer. @default "senior" */
  tranche?: 'senior' | 'junior';
  /** Headline rate, e.g. "7.2%". */
  apr: React.ReactNode;
  /** Small label under the rate. */
  aprLabel?: React.ReactNode;
  /** Override the tranche name. */
  name?: React.ReactNode;
  /** Override the one-line role description. */
  role?: React.ReactNode;
  /** Key/value detail rows (coverage, premium, capacity remaining…). */
  rows?: TrancheRow[];
  /** Capacity-filled percent (renders a meter). */
  capacityPct?: number;
  /** Label for the capacity meter. */
  capacityLabel?: React.ReactNode;
  /** Plain-language risk footnote. */
  footnote?: React.ReactNode;
  /** Selected state. */
  selected?: boolean;
  /** Click handler. */
  onSelect?: () => void;
}

export function TrancheCard(props: TrancheCardProps): JSX.Element;
