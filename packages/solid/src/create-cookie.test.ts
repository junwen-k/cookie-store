import { cookieStoreCache } from '@cookie-store/core';
import { renderHook } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createCookie, createCookies } from './create-cookie';

describe('createCookie', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('reactivity', () => {
    it('should return null when cookie does not exist', () => {
      const { result } = renderHook(() => createCookie('test'));

      expect(result()).toBeNull();
    });

    it('should return cookie value when it exists', async () => {
      await window.cookieStore.set('test', 'value123');

      const { result } = renderHook(() => createCookie('test'));

      expect(result()).toMatchObject({ name: 'test', value: 'value123' });
    });

    it('should update when cookie changes', async () => {
      const { result } = renderHook(() => createCookie('test'));

      expect(result()).toBeNull();

      await window.cookieStore.set('test', 'initial');
      expect(result()).toMatchObject({ name: 'test', value: 'initial' });

      await window.cookieStore.set('test', 'updated');
      expect(result()).toMatchObject({ name: 'test', value: 'updated' });
    });

    it('should update when cookie is deleted', async () => {
      await window.cookieStore.set('test', 'value123');

      const { result } = renderHook(() => createCookie('test'));

      expect(result()).toMatchObject({ name: 'test', value: 'value123' });

      await window.cookieStore.delete('test');

      expect(result()).toBeNull();
    });

    it('should not update for unrelated cookie changes', async () => {
      const { result } = renderHook(() => createCookie('test1'));

      expect(result()).toBeNull();

      await window.cookieStore.set('test2', 'other-value');

      expect(result()).toBeNull();
    });

    it('should not trigger signal update for unrelated cookie changes', async () => {
      await window.cookieStore.set('test', 'value123');

      let effectRunCount = 0;
      const { result } = renderHook(() => {
        const cookie = createCookie('test');
        effectRunCount++;
        return cookie;
      });

      expect(result()?.value).toBe('value123');

      const effectCountAfterMount = effectRunCount;

      await window.cookieStore.set('other', 'otherValue');

      expect(effectRunCount).toBe(effectCountAfterMount);
    });
  });

  describe('event listener management', () => {
    it('should subscribe to cache events on mount', () => {
      const addEventListenerSpy = vi.spyOn(cookieStoreCache, 'addEventListener');

      renderHook(() => createCookie('test'));

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from cache events on cleanup', () => {
      const removeEventListenerSpy = vi.spyOn(cookieStoreCache, 'removeEventListener');

      const { cleanup } = renderHook(() => createCookie('test'));

      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});

describe('createCookies', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('reactivity', () => {
    it('should return empty array when no cookies exist', () => {
      const { result } = renderHook(() => createCookies());

      expect(result()).toEqual([]);
    });

    it('should return all cookies when no filter provided', async () => {
      await window.cookieStore.set('cookie1', 'value1');
      await window.cookieStore.set('cookie2', 'value2');

      const { result } = renderHook(() => createCookies());

      expect(result()).toHaveLength(2);
      expect(result()[0]).toMatchObject({ name: 'cookie1', value: 'value1' });
      expect(result()[1]).toMatchObject({ name: 'cookie2', value: 'value2' });
    });

    it('should update when cookies change', async () => {
      const { result } = renderHook(() => createCookies());

      expect(result()).toEqual([]);

      await window.cookieStore.set('test', 'initial');
      expect(result()).toHaveLength(1);
      expect(result()[0]).toMatchObject({ name: 'test', value: 'initial' });

      await window.cookieStore.set('test', 'updated');
      expect(result()).toHaveLength(1);
      expect(result()[0]).toMatchObject({ name: 'test', value: 'updated' });
    });

    it('should update when cookie is added', async () => {
      const { result } = renderHook(() => createCookies());

      expect(result()).toEqual([]);

      await window.cookieStore.set('new', 'value');

      expect(result()).toHaveLength(1);
      expect(result()[0]).toMatchObject({ name: 'new', value: 'value' });
    });

    it('should update when cookie is deleted', async () => {
      await window.cookieStore.set('test', 'value');

      const { result } = renderHook(() => createCookies());

      expect(result()).toHaveLength(1);

      await window.cookieStore.delete('test');

      expect(result()).toEqual([]);
    });

    it('should filter by name when provided', async () => {
      await window.cookieStore.set('watched', 'value1');
      await window.cookieStore.set('ignored', 'value2');

      const { result } = renderHook(() => createCookies('watched'));

      expect(result()).toHaveLength(1);
      expect(result()[0]).toMatchObject({ name: 'watched', value: 'value1' });
    });

    it('should not update for unrelated cookie changes when filtered', async () => {
      await window.cookieStore.set('watched', 'value1');

      const { result } = renderHook(() => createCookies('watched'));

      expect(result()).toHaveLength(1);

      await window.cookieStore.set('ignored', 'value2');

      expect(result()).toHaveLength(1);
      expect(result()[0]).toMatchObject({ name: 'watched', value: 'value1' });
    });
  });

  describe('event listener management', () => {
    it('should subscribe to cache events on mount', () => {
      const addEventListenerSpy = vi.spyOn(cookieStoreCache, 'addEventListener');

      renderHook(() => createCookies());

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from cache events on cleanup', () => {
      const removeEventListenerSpy = vi.spyOn(cookieStoreCache, 'removeEventListener');

      const { cleanup } = renderHook(() => createCookies());

      cleanup();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
