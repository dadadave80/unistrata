import * as React from 'react';

/**
 * A tabular numeric that animates from its previous value to the new one
 * whenever `value` changes — easing out over ~520ms. Numbers tick, never
 * fade. Honors reduced-motion (snaps instantly).
 */
export interface NumberTickerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'prefix'> {
  /** The target value. */
  value: number;
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
}

export function NumberTicker(props: NumberTickerProps): JSX.Element;
