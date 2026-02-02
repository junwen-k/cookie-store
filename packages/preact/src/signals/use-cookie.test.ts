import { cookieStoreCache } from '@cookie-store/core';
import { act, renderHook, waitFor } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCookie, useCookies } from './use-cookie';

describe('useCookie (signals)', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('reactivity', () => {
    it('should return null when cookie does not exist', () => {
      const { result } = renderHook(() => useCookie('test'));

      expect(result.current.value).toBeNull();
    });

    it('should return cookie value when it exists', async () => {
      await window.cookieStore.set('test', 'value123');

      const { result } = renderHook(() => useCookie('test'));

      expect(result.current.value).toMatchObject({ name: 'test', value: 'value123' });
    });

    it('should update when cookie changes', async () => {
      const { result } = renderHook(() => useCookie('test'));

      expect(result.current.value).toBeNull();

      await act(async () => {
        await window.cookieStore.set('test', 'initial');
      });

      await waitFor(() => {
        expect(result.current.value).toMatchObject({ name: 'test', value: 'initial' });
      });

      await act(async () => {
        await window.cookieStore.set('test', 'updated');
      });

      await waitFor(() => {
        expect(result.current.value).toMatchObject({ name: 'test', value: 'updated' });
      });
    });

    it('should update when cookie is deleted', async () => {
      await window.cookieStore.set('test', 'value123');

      const { result } = renderHook(() => useCookie('test'));

      expect(result.current.value).toMatchObject({ name: 'test', value: 'value123' });

      await act(async () => {
        await window.cookieStore.delete('test');
      });

      expect(result.current.value).toBeNull();
    });

    it('should not update for unrelated cookie changes', async () => {
      const { result } = renderHook(() => useCookie('test1'));

      expect(result.current.value).toBeNull();

      await act(async () => {
        await window.cookieStore.set('test2', 'other-value');
      });

      expect(result.current.value).toBeNull();
    });

    it('should not trigger re-render for unrelated cookie changes', async () => {
      await window.cookieStore.set('test', 'value123');

      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useCookie('test');
      });

      expect(result.current.value?.value).toBe('value123');

      const renderCountAfterMount = renderCount;

      await act(async () => {
        await window.cookieStore.set('other', 'otherValue');
      });

      expect(renderCount).toBe(renderCountAfterMount);
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

describe('useCookies (signals)', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('reactivity', () => {
    it('should return empty array when no cookies exist', () => {
      const { result } = renderHook(() => useCookies());

      expect(result.current.value).toEqual([]);
    });

    it('should return all cookies when no filter provided', async () => {
      await window.cookieStore.set('cookie1', 'value1');
      await window.cookieStore.set('cookie2', 'value2');

      const { result } = renderHook(() => useCookies());

      expect(result.current.value).toHaveLength(2);
      expect(result.current.value[0]).toMatchObject({ name: 'cookie1', value: 'value1' });
      expect(result.current.value[1]).toMatchObject({ name: 'cookie2', value: 'value2' });
    });

    it('should update when cookies change', async () => {
      const { result } = renderHook(() => useCookies());

      expect(result.current.value).toEqual([]);

      await act(async () => {
        await window.cookieStore.set('test', 'initial');
      });

      await waitFor(() => {
        expect(result.current.value).toHaveLength(1);
        expect(result.current.value[0]).toMatchObject({ name: 'test', value: 'initial' });
      });

      await act(async () => {
        await window.cookieStore.set('test', 'updated');
      });

      await waitFor(() => {
        expect(result.current.value).toHaveLength(1);
        expect(result.current.value[0]).toMatchObject({ name: 'test', value: 'updated' });
      });
    });

    it('should update when cookie is added', async () => {
      const { result } = renderHook(() => useCookies());

      expect(result.current.value).toEqual([]);

      await act(async () => {
        await window.cookieStore.set('new', 'value');
      });

      await waitFor(() => {
        expect(result.current.value).toHaveLength(1);
        expect(result.current.value[0]).toMatchObject({ name: 'new', value: 'value' });
      });
    });

    it('should update when cookie is deleted', async () => {
      await window.cookieStore.set('test', 'value');

      const { result } = renderHook(() => useCookies());

      expect(result.current.value).toHaveLength(1);

      await act(async () => {
        await window.cookieStore.delete('test');
      });

      expect(result.current.value).toEqual([]);
    });

    it('should filter by name when provided', async () => {
      await window.cookieStore.set('watched', 'value1');
      await window.cookieStore.set('ignored', 'value2');

      const { result } = renderHook(() => useCookies('watched'));

      expect(result.current.value).toHaveLength(1);
      expect(result.current.value[0]).toMatchObject({ name: 'watched', value: 'value1' });
    });

    it('should not update for unrelated cookie changes when filtered', async () => {
      await window.cookieStore.set('watched', 'value1');

      const { result } = renderHook(() => useCookies('watched'));

      expect(result.current.value).toHaveLength(1);

      await act(async () => {
        await window.cookieStore.set('ignored', 'value2');
      });

      expect(result.current.value).toHaveLength(1);
      expect(result.current.value[0]).toMatchObject({ name: 'watched', value: 'value1' });
    });
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
  });
});
