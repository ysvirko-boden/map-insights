import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should delay function execution', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced('test');

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledWith('test');
    expect(callback).toHaveBeenCalledOnce();
  });

  it('should cancel previous call on rapid invocations', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced('first');
    vi.advanceTimersByTime(100);

    debounced('second');
    vi.advanceTimersByTime(100);

    debounced('third');
    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledOnce();
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('should pass arguments correctly', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced('arg1', 'arg2', 'arg3');
    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should work with multiple arguments of different types', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 300);

    debounced(123, 'string', { key: 'value' }, [1, 2, 3]);
    vi.advanceTimersByTime(300);

    expect(callback).toHaveBeenCalledWith(123, 'string', { key: 'value' }, [1, 2, 3]);
  });

  it('should use default delay of 300ms when not specified', () => {
    const callback = vi.fn();
    const debounced = debounce(callback);

    debounced();
    vi.advanceTimersByTime(299);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledOnce();
  });

  it('should allow custom delay', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 500);

    debounced();
    vi.advanceTimersByTime(499);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledOnce();
  });
});
