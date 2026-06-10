import * as React from 'react';

/**
 * Live countdown to the next epoch settlement, with an elapsed-fraction
 * meter. Ticks every second; calls onSettle and rolls over at zero.
 */
export interface EpochCountdownProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current epoch number. @default 47 */
  epoch?: number;
  /** Seconds remaining until settlement. @default 11529 */
  secondsLeft?: number;
  /** Epoch length in seconds. @default 28800 (8h) */
  epochLength?: number;
  /** Whether the clock ticks. @default true */
  running?: boolean;
  /** Fired when the countdown reaches zero. */
  onSettle?: () => void;
}

export function EpochCountdown(props: EpochCountdownProps): JSX.Element;
