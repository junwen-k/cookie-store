import { cookieStoreCache } from '@cookie-store/core';
import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCookie, useCookies } from './use-cookie';

describe('useCookie', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when cookie does not exist', async () => {
    const { result } = renderHook(() => useCookie('test'));

    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });

  it('should return cookie value when it exists', async () => {
    await window.cookieStore.set('test', 'value123');

    const { result } = renderHook(() => useCookie('test'));

    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current?.name).toBe('test');
      expect(result.current?.value).toBe('value123');
    });
  });

  it('should update when cookie changes', async () => {
    const { result } = renderHook(() => useCookie('test'));

    await waitFor(() => {
      expect(result.current).toBeNull();
    });

    // Set cookie
    await window.cookieStore.set('test', 'initial');

    await waitFor(() => {
      expect(result.current?.value).toBe('initial');
    });

    // Update cookie
    await window.cookieStore.set('test', 'updated');

    await waitFor(() => {
      expect(result.current?.value).toBe('updated');
    });
  });

  it('should update when cookie is deleted', async () => {
    await window.cookieStore.set('test', 'value123');

    const { result } = renderHook(() => useCookie('test'));

    await waitFor(() => {
      expect(result.current?.value).toBe('value123');
    });

    // Delete cookie
    await window.cookieStore.delete('test');

    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });

  it('should not update for unrelated cookie changes', async () => {
    await window.cookieStore.set('test', 'value123');

    const { result } = renderHook(() => useCookie('test'));

    await waitFor(() => {
      expect(result.current?.value).toBe('value123');
    });

    const initialResult = result.current;

    // Set a different cookie
    await window.cookieStore.set('other', 'otherValue');

    // Should still be the same object reference
    expect(result.current).toBe(initialResult);
  });

  it('should handle multiple subscribers', async () => {
    await window.cookieStore.set('test', 'value123');

    const { result: result1 } = renderHook(() => useCookie('test'));
    const { result: result2 } = renderHook(() => useCookie('test'));

    await waitFor(() => {
      expect(result1.current?.value).toBe('value123');
      expect(result2.current?.value).toBe('value123');
    });

    // Update cookie
    await window.cookieStore.set('test', 'updated');

    await waitFor(() => {
      expect(result1.current?.value).toBe('updated');
      expect(result2.current?.value).toBe('updated');
    });
  });

  describe('event listener management', () => {
    it('should subscribe to cache events on mount', () => {
      const addEventListenerSpy = vi.spyOn(cookieStoreCache, 'addEventListener');

      renderHook(() => useCookie('test'));

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from cache events on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(cookieStoreCache, 'removeEventListener');

      const { unmount } = renderHook(() => useCookie('test'));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});

describe('useCookies', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty map when no cookies exist', async () => {
    const { result } = renderHook(() => useCookies());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('should return all cookies when no filter provided', async () => {
    await window.cookieStore.set('cookie1', 'value1');
    await window.cookieStore.set('cookie2', 'value2');

    const { result } = renderHook(() => useCookies());

    await waitFor(() => {
      expect(result.current).toHaveLength(2);
      expect(result.current[0]).toMatchObject({ name: 'cookie1', value: 'value1' });
      expect(result.current[1]).toMatchObject({ name: 'cookie2', value: 'value2' });
    });
  });

  it('should update when cookies change', async () => {
    await window.cookieStore.set('test', 'initial');

    const { result } = renderHook(() => useCookies('test'));

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({ name: 'test', value: 'initial' });
    });

    // Update cookie
    await window.cookieStore.set('test', 'updated');

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({ name: 'test', value: 'updated' });
    });
  });

  it('should update when cookie is added', async () => {
    const { result } = renderHook(() => useCookies());

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });

    // Add cookie
    await window.cookieStore.set('new', 'value');

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({ name: 'new', value: 'value' });
    });
  });

  it('should update when cookie is deleted', async () => {
    await window.cookieStore.set('test', 'value');

    const { result } = renderHook(() => useCookies('test'));

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({ name: 'test', value: 'value' });
    });

    // Delete cookie
    await window.cookieStore.delete('test');

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });
  });

  it('should not update for unrelated cookie changes when filtered', async () => {
    await window.cookieStore.set('watched', 'value1');
    await window.cookieStore.set('unwatched', 'value2');

    const { result } = renderHook(() => useCookies('watched'));

    await waitFor(() => {
      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({ name: 'watched', value: 'value1' });
    });

    const initialResult = result.current;

    // Update unwatched cookie
    await window.cookieStore.set('unwatched', 'updated');

    // Wait a bit to ensure no update
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should still be the same object reference
    expect(result.current).toBe(initialResult);
  });

  describe('event listener management', () => {
    it('should subscribe to cache events on mount', () => {
      const addEventListenerSpy = vi.spyOn(cookieStoreCache, 'addEventListener');

      renderHook(() => useCookies());

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from cache events on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(cookieStoreCache, 'removeEventListener');

      const { unmount } = renderHook(() => useCookies());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });

    it('should handle multiple subscribers', async () => {
      await window.cookieStore.set('test1', 'value1');
      await window.cookieStore.set('test2', 'value2');

      const { result: result1 } = renderHook(() => useCookies());
      const { result: result2 } = renderHook(() => useCookies());

      await waitFor(() => {
        expect(result1.current).toHaveLength(2);
        expect(result2.current).toHaveLength(2);
      });

      // Add another cookie
      await window.cookieStore.set('test3', 'value3');

      await waitFor(() => {
        expect(result1.current).toHaveLength(3);
        expect(result2.current).toHaveLength(3);
      });
    });
  });
});
