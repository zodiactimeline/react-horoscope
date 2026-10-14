import { useCallback, useEffect, useState } from 'react';
import { fetchHoroscopeFeed } from './feed';
import type { HoroscopeFeed } from './types';

export interface HoroscopeFeedState {
  status: 'loading' | 'success' | 'error';
  /** Parsed feed, set once `status` is `success`. */
  feed?: HoroscopeFeed;
  /** Load failure, set when `status` is `error`. */
  error?: Error;
  /** Requests the feed again after a failure. */
  retry: () => void;
}

type State = Omit<HoroscopeFeedState, 'retry'>;

/**
 * Loads the Zodiac Timeline feed for use in a custom UI.
 *
 * All components and hooks on the page share a single request, so calling this
 * hook in several places does not refetch the feed.
 */
export function useHoroscopeFeed(): HoroscopeFeedState {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Ignore results that arrive after unmount or a newer retry.
    let active = true;
    fetchHoroscopeFeed().then(
      (feed) => {
        if (active) setState({ status: 'success', feed });
      },
      (error: unknown) => {
        if (active) {
          setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) });
        }
      },
    );
    return () => {
      active = false;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { ...state, retry };
}
