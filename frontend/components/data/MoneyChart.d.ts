import * as React from 'react';

export interface MoneyChartSeries {
  /** Buy-and-hold reference (dashed neutral). */
  hodl: number[];
  /** Vanilla LP — bleeds through volatility (clay). */
  lp: number[];
  /** Strata senior — the calm coupon line (teal). */
  senior: number[];
  /** Strata junior — levered, kinetic (amber). */
  junior: number[];
}

/**
 * The money chart: four portfolio paths over a volatile price backdrop —
 * HODL, vanilla LP, Strata senior, Strata junior. Senior tracks a calm
 * line through a price swing while vanilla LP bleeds. Drive `progress`
 * (0–1) from a scrubber to reveal the lines in sync with a price path.
 */
export interface MoneyChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Equal-length value arrays, one per role. */
  series: MoneyChartSeries;
  /** Underlying price path for the faint backdrop area. */
  price?: number[];
  /** Reveal fraction 0–1 (scrubber). @default 1 */
  progress?: number;
  /** Pixel height. @default 320 */
  height?: number;
  /** Show the inline value legend. @default true */
  showLegend?: boolean;
  /** Show the price backdrop. @default true */
  showPrice?: boolean;
}

export function MoneyChart(props: MoneyChartProps): JSX.Element;
