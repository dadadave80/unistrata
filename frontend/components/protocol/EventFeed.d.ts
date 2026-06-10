import * as React from 'react';

type FeedEvent = {
  /** Mono timestamp, e.g. "14:02:11" or "2d ago". */
  time: string;
  /** Row marker color/role. */
  kind: 'settle' | 'reactive' | 'emergency' | 'info';
  /** Message — may contain <span class="fn"> for fn() calls and <span class="em"> for alerts. */
  message: string;
  /** Truncated tx hash, e.g. "0x7a3f…e201". */
  tx?: string;
  /** Chain / network label. */
  chain?: string;
  /** Related epoch number. */
  epoch?: number;
};

/**
 * Terminal-like ledger of cross-chain events — the proof there are no
 * humans behind the curtain. Reactive Network watches the pool and fires
 * settlements autonomously; each row links to the explorer.
 *
 * @startingPoint section="Protocol" subtitle="Reactive automation ledger" viewport="640x440"
 */
export interface EventFeedProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Newest-first event rows. */
  events: FeedEvent[];
  /** Header label. */
  title?: string;
  /** Scroll cap in px. */
  maxHeight?: number;
  /** Base URL for tx links. */
  explorerBase?: string;
}

export function EventFeed(props: EventFeedProps): JSX.Element;
