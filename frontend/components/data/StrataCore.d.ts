import * as React from 'react';

/**
 * THE signature element — a living cross-section of the pool's capital
 * structure as horizontal sedimentary layers. Senior is the dense bedrock
 * at the bottom; junior sits above; overburden/impairment is the void on
 * top. Layer heights are driven by real NAV against a fixed `scaleMax`, so
 * when impermanent loss hits, the junior layer visibly compresses while
 * senior holds its line. Bump `sweepKey` to fire the cinematic settlement
 * sweep. Use `glyph` for the miniature nav/logo version.
 *
 * @startingPoint section="Signature" subtitle="The living capital-structure cross-section" viewport="640x420"
 */
export interface StrataCoreProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Senior tranche NAV (USD). */
  seniorNav?: number;
  /** Junior tranche NAV (USD). */
  juniorNav?: number;
  /** Fixed NAV→pixel reference so layers stay comparable as values move.
   *  Defaults to (senior+junior)·1.18 to leave overburden headroom. */
  scaleMax?: number;
  /** Pixel height of the full core. @default 360 */
  height?: number;
  /** Increment this to trigger one settlement sweep. @default 0 */
  sweepKey?: number;
  /** Miniature mode (nav glyph / logo) — no labels or scale. */
  glyph?: boolean;
  /** Show the right-hand depth/NAV scale. @default true */
  showScale?: boolean;
}

export function StrataCore(props: StrataCoreProps): JSX.Element;
