import { CookieStoreCache } from '@cookie-store/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import TestSvelteCookieStoreComponent from './fixtures/test-svelte-cookie-store.svelte';
import { SvelteCookieStore, svelteCookieStore } from './svelte-cookie-store';

describe('SvelteCookieStore', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('class', () => {
    it('should extend CookieStoreCache', () => {
      const store = new SvelteCookieStore();

      expect(store).toBeInstanceOf(CookieStoreCache);
      expect(store).toBeInstanceOf(SvelteCookieStore);
    });

    it('should use singleton instance', () => {
      expect(svelteCookieStore).toBeInstanceOf(SvelteCookieStore);
    });
  });

  describe('reactivity', () => {
    it('should return initial null state for get', async () => {
      const screen = render(TestSvelteCookieStoreComponent, {
        name: 'test',
      });

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should update when cookie is set', async () => {
      const screen = render(TestSvelteCookieStoreComponent, {
        name: 'test',
      });

      await window.cookieStore.set('test', 'value123');

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('value123');
    });

    it('should update when cookie is modified', async () => {
      const screen = render(TestSvelteCookieStoreComponent, {
        name: 'test',
      });

      await window.cookieStore.set('test', 'initial');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('initial');

      await window.cookieStore.set('test', 'updated');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('updated');
    });

    it('should update when cookie is deleted', async () => {
      const screen = render(TestSvelteCookieStoreComponent, {
        name: 'test',
      });

      await window.cookieStore.set('test', 'value123');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('value123');

      await window.cookieStore.delete('test');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should not update for different cookie changes', async () => {
      const screen = render(TestSvelteCookieStoreComponent, {
        name: 'test1',
      });

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');

      await window.cookieStore.set('test2', 'other-value');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should return initial empty state for getAll', async () => {
      const screen = render(TestSvelteCookieStoreComponent, {});

      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('0');
    });

    it('should update getAll when cookies are added', async () => {
      const screen = render(TestSvelteCookieStoreComponent, {});

      await window.cookieStore.set('test1', 'value1');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('1');

      await window.cookieStore.set('test2', 'value2');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('2');
    });

    it('should filter getAll by name when provided', async () => {
      await window.cookieStore.set('test1', 'value1');
      await window.cookieStore.set('test2', 'value2');

      const screen = render(TestSvelteCookieStoreComponent, {
        filterName: 'test1',
      });

      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('1');
    });

    it('should update getAll when cookie is deleted', async () => {
      const screen = render(TestSvelteCookieStoreComponent, {});

      await window.cookieStore.set('test1', 'value1');
      await window.cookieStore.set('test2', 'value2');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('2');

      await window.cookieStore.delete('test1');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('1');
    });
  });
});
