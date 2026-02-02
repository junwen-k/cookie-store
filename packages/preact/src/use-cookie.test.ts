import { act, renderHook } from '@testing-library/preact';
import { cookieCache, cookieStore } from '@cookie-store/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useCookie, useCookies } from './use-cookie';

describe('useCookie', () => {
  beforeEach(async () => {
    // Clear all cookies before each test
    if (cookieStore) {
      const allCookies = await cookieStore.getAll();
      await Promise.all(allCookies.map((cookie) => cookieStore!.delete(cookie.name)));
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('reactivity', () => {
    it('should return null when cookie does not exist', () => {
      const { result } = renderHook(() => useCookie('test'));

      expect(result.current).toBeNull();
    });

    it('should return cookie value when it exists', async () => {
      await cookieStore!.set('test', 'value123');

      const { result } = renderHook(() => useCookie('test'));

      expect(result.current).toMatchObject({ name: 'test', value: 'value123' });
    });

    it('should update when cookie changes', async () => {
      const { result } = renderHook(() => useCookie('test'));

      expect(result.current).toBeNull();

      await act(async () => {
        await cookieStore!.set('test', 'initial');
      });

      expect(result.current).toMatchObject({ name: 'test', value: 'initial' });

      await act(async () => {
        await cookieStore!.set('test', 'updated');
      });

      expect(result.current).toMatchObject({ name: 'test', value: 'updated' });
    });

    it('should update when cookie is deleted', async () => {
      await cookieStore!.set('test', 'value123');

      const { result } = renderHook(() => useCookie('test'));

      expect(result.current).toMatchObject({ name: 'test', value: 'value123' });

      await act(async () => {
        await cookieStore!.delete('test');
      });

      expect(result.current).toBeNull();
    });

    it('should not update for unrelated cookie changes', async () => {
      const { result } = renderHook(() => useCookie('test1'));

      expect(result.current).toBeNull();

      await act(async () => {
        await cookieStore!.set('test2', 'other-value');
      });

      expect(result.current).toBeNull();
    });
  });

  describe('event listener management', () => {
    it('should subscribe to cache events on mount', () => {
      const addEventListenerSpy = vi.spyOn(cookieCache, 'addEventListener');

      renderHook(() => useCookie('test'));

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from cache events on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(cookieCache, 'removeEventListener');

      const { unmount } = renderHook(() => useCookie('test'));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});

describe('useCookies', () => {
  beforeEach(async () => {
    // Clear all cookies before each test
    if (cookieStore) {
      const allCookies = await cookieStore.getAll();
      await Promise.all(allCookies.map((cookie) => cookieStore!.delete(cookie.name)));
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('reactivity', () => {
    it('should return empty array when no cookies exist', () => {
      const { result } = renderHook(() => useCookies());

      expect(result.current).toEqual([]);
    });

    it('should return all cookies when no filter provided', async () => {
      await cookieStore!.set('cookie1', 'value1');
      await cookieStore!.set('cookie2', 'value2');

      const { result } = renderHook(() => useCookies());

      expect(result.current).toHaveLength(2);
      expect(result.current[0]).toMatchObject({ name: 'cookie1', value: 'value1' });
      expect(result.current[1]).toMatchObject({ name: 'cookie2', value: 'value2' });
    });

    it('should update when cookies change', async () => {
      const { result } = renderHook(() => useCookies());

      expect(result.current).toEqual([]);

      await act(async () => {
        await cookieStore!.set('test', 'initial');
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({ name: 'test', value: 'initial' });

      await act(async () => {
        await cookieStore!.set('test', 'updated');
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({ name: 'test', value: 'updated' });
    });

    it('should update when cookie is added', async () => {
      const { result } = renderHook(() => useCookies());

      expect(result.current).toEqual([]);

      await act(async () => {
        await cookieStore!.set('new', 'value');
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({ name: 'new', value: 'value' });
    });

    it('should update when cookie is deleted', async () => {
      await cookieStore!.set('test', 'value');

      const { result } = renderHook(() => useCookies());

      expect(result.current).toHaveLength(1);

      await act(async () => {
        await cookieStore!.delete('test');
      });

      expect(result.current).toEqual([]);
    });

    it('should filter by name when provided', async () => {
      await cookieStore!.set('watched', 'value1');
      await cookieStore!.set('ignored', 'value2');

      const { result } = renderHook(() => useCookies('watched'));

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({ name: 'watched', value: 'value1' });
    });

    it('should not update for unrelated cookie changes when filtered', async () => {
      await cookieStore!.set('watched', 'value1');

      const { result } = renderHook(() => useCookies('watched'));

      expect(result.current).toHaveLength(1);

      await act(async () => {
        await cookieStore!.set('ignored', 'value2');
      });

      expect(result.current).toHaveLength(1);
      expect(result.current[0]).toMatchObject({ name: 'watched', value: 'value1' });
    });
  });

  describe('event listener management', () => {
    it('should subscribe to cache events on mount', () => {
      const addEventListenerSpy = vi.spyOn(cookieCache, 'addEventListener');

      renderHook(() => useCookies());

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from cache events on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(cookieCache, 'removeEventListener');

      const { unmount } = renderHook(() => useCookies());

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
