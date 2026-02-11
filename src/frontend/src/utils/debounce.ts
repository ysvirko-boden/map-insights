/**
 * Creates a debounced function that delays invoking the callback until after
 * the specified wait time has elapsed since the last time the debounced function was invoked.
 *
 * @param callback - The function to debounce
 * @param delay - The number of milliseconds to delay (default: 300ms)
 * @returns A debounced version of the callback function
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  callback: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return function debounced(...args: Parameters<T>): void {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
