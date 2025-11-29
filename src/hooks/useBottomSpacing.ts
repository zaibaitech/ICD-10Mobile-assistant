import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Returns a memoized bottom padding value that accounts for the device's safe area.
 * Extra space is included to guarantee scrollable content clears floating UI like tab bars.
 */
export const useBottomSpacing = (extra: number = 80) => {
  const insets = useSafeAreaInsets();

  return useMemo(() => {
    const safeInset = Math.max(insets.bottom, 16);
    return safeInset + extra;
  }, [extra, insets.bottom]);
};
