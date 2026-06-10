import * as React from 'react';

/**
 * Radial instrument gauge — built for the realized-volatility readout fed
 * by the pool's own price ticks. A 250° arc with a glowing fill, optional
 * threshold ticks, and a tabular value at center.
 */
export interface GaugeThreshold { at: number; color?: string; }

export interface GaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value. */
  value: number;
  /** Scale min. @default 0 */
  min?: number;
  /** Scale max. @default 1 */
  max?: number;
  /** Diameter in px. @default 180 */
  size?: number;
  /** Arc sweep in degrees (gap at bottom). @default 250 */
  sweepDeg?: number;
  /** Arc color. @default "senior" */
  tone?: 'senior' | 'junior' | 'loss';
  /** Pre-formatted center text (else value is shown raw). */
  valueText?: React.ReactNode;
  /** Small unit under the value. */
  unit?: React.ReactNode;
  /** Marker ticks on the arc. */
  thresholds?: GaugeThreshold[];
}

export function Gauge(props: GaugeProps): JSX.Element;
