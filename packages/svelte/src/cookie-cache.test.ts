import {
  CookieStoreCache as CoreCookieStoreCache,
  cookieCache as coreCookieCache,
  cookieStore,
} from '@cookie-store/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { CookieStoreCache, cookieCache } from './cookie-cache';
import TestCookieCacheComponent from './fixtures/test-cookie-cache.svelte';

describe('CookieStoreCache', () => {
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

  describe('class', () => {
    it('should extend CoreCookieStoreCache', () => {
      const cache = new CookieStoreCache();

      expect(cache).toBeInstanceOf(CoreCookieStoreCache);
      expect(cache).toBeInstanceOf(CookieStoreCache);
    });

    it('should use singleton instance', () => {
      expect(cookieCache).toBeInstanceOf(CookieStoreCache);
    });
  });

  describe('reactivity', () => {
    it('should return initial null state for get', async () => {
      const screen = render(TestCookieCacheComponent, {
        name: 'test',
      });

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should update when cookie is set', async () => {
      const screen = render(TestCookieCacheComponent, {
        name: 'test',
      });

      await cookieStore!.set('test', 'value123');

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('value123');
    });

    it('should update when cookie is modified', async () => {
      const screen = render(TestCookieCacheComponent, {
        name: 'test',
      });

      await cookieStore!.set('test', 'initial');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('initial');

      await cookieStore!.set('test', 'updated');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('updated');
    });

    it('should update when cookie is deleted', async () => {
      const screen = render(TestCookieCacheComponent, {
        name: 'test',
      });

      await cookieStore!.set('test', 'value123');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('value123');

      await cookieStore!.delete('test');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should not update for different cookie changes', async () => {
      const screen = render(TestCookieCacheComponent, {
        name: 'test1',
      });

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');

      await cookieStore!.set('test2', 'other-value');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should return initial empty state for getAll', async () => {
      const screen = render(TestCookieCacheComponent, {});

      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('0');
    });

    it('should update getAll when cookies are added', async () => {
      const screen = render(TestCookieCacheComponent, {});

      await cookieStore!.set('test1', 'value1');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('1');

      await cookieStore!.set('test2', 'value2');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('2');
    });

    it('should filter getAll by name when provided', async () => {
      await cookieStore!.set('test1', 'value1');
      await cookieStore!.set('test2', 'value2');

      const screen = render(TestCookieCacheComponent, {
        filterName: 'test1',
      });

      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('1');
    });

    it('should update getAll when cookie is deleted', async () => {
      const screen = render(TestCookieCacheComponent, {});

      await cookieStore!.set('test1', 'value1');
      await cookieStore!.set('test2', 'value2');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('2');

      await cookieStore!.delete('test1');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('1');
    });
  });

  describe('event listener management', () => {
    it('should subscribe to cache events on mount', () => {
      const addEventListenerSpy = vi.spyOn(coreCookieCache, 'addEventListener');

      render(TestCookieCacheComponent, {
        name: 'test',
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from cache events on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(coreCookieCache, 'removeEventListener');

      const { unmount } = render(TestCookieCacheComponent, {
        name: 'test',
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
