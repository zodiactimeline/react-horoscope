import { useCallback, useEffect, useState } from 'react';
import { fetchHoroscopeApi } from './api';
import type { HoroscopeApiResponse } from './types';

export interface HoroscopeApiState {
  status: 'loading' | 'success' | 'error';
  /** Parsed response, set once `status` is `success`. */
  data?: HoroscopeApiResponse;
  /** Load failure, set when `status` is `error`. */
  error?: Error;
  /** Requests the Horoscope API again after a failure. */
  retry: () => void;
}

type State = Omit<HoroscopeApiState, 'retry'>;

/**
 * Loads the Zodiac Timeline Horoscope API for use in a custom UI.
 *
 * All components and hooks on the page share a single request, so calling this
 * hook in several places does not refetch the data.
 */
export function useHoroscopeApi(): HoroscopeApiState {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // Ignore results that arrive after unmount or a newer retry.
    let active = true;
    fetchHoroscopeApi().then(
      (data) => {
        if (active) setState({ status: 'success', data });
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
