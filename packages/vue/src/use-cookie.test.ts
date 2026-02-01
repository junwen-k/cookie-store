import { cookieCache, cookieStore } from '@cookie-store/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-vue';

import TestUseCookieComponent from './fixtures/test-use-cookie.vue';
import TestUseCookiesComponent from './fixtures/test-use-cookies.vue';

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
    it('should return initial state', async () => {
      const screen = render(TestUseCookieComponent, {
        props: { name: 'test' },
      });

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should update when cookie is set', async () => {
      const screen = render(TestUseCookieComponent, {
        props: { name: 'test' },
      });

      await cookieStore!.set('test', 'value123');

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('value123');
    });

    it('should update when cookie is modified', async () => {
      const screen = render(TestUseCookieComponent, {
        props: { name: 'test' },
      });

      await cookieStore!.set('test', 'initial');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('initial');

      await cookieStore!.set('test', 'updated');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('updated');
    });

    it('should update when cookie is deleted', async () => {
      const screen = render(TestUseCookieComponent, {
        props: { name: 'test' },
      });

      await cookieStore!.set('test', 'value123');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('value123');

      await cookieStore!.delete('test');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should not update for different cookie changes', async () => {
      const screen = render(TestUseCookieComponent, {
        props: { name: 'test1' },
      });

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');

      await cookieStore!.set('test2', 'other-value');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');
    });
  });

  describe('event listener management', () => {
    it('should subscribe to cache events on mount', async () => {
      const addEventListenerSpy = vi.spyOn(cookieCache, 'addEventListener');

      render(TestUseCookieComponent, {
        props: { name: 'test' },
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from cache events on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(cookieCache, 'removeEventListener');

      const { unmount } = render(TestUseCookieComponent, {
        props: { name: 'test' },
      });

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
    it('should return initial empty state', async () => {
      const screen = render(TestUseCookiesComponent, {
        props: { names: ['test1', 'test2'] },
      });

      await expect.element(screen.getByTestId('cookies-size')).toHaveTextContent('0');
    });

    it('should update when filtered cookie is set', async () => {
      const screen = render(TestUseCookiesComponent, {
        props: { names: ['test1', 'test2'] },
      });

      await cookieStore!.set('test1', 'value1');
      await expect.element(screen.getByTestId('cookies-size')).toHaveTextContent('1');

      await cookieStore!.set('test2', 'value2');
      await expect.element(screen.getByTestId('cookies-size')).toHaveTextContent('2');
    });

    it('should not update for non-filtered cookies', async () => {
      const screen = render(TestUseCookiesComponent, {
        props: { names: ['test1', 'test2'] },
      });

      await cookieStore!.set('test3', 'value3');
      await expect.element(screen.getByTestId('cookies-size')).toHaveTextContent('0');
    });

    it('should watch all cookies when no names provided', async () => {
      const screen = render(TestUseCookiesComponent, {
        props: {},
      });

      await cookieStore!.set('test1', 'value1');
      await cookieStore!.set('test2', 'value2');
      await cookieStore!.set('test3', 'value3');

      await expect.element(screen.getByTestId('cookies-size')).toHaveTextContent('3');
    });

    it('should update when cookie is deleted', async () => {
      const screen = render(TestUseCookiesComponent, {
        props: { names: ['test1', 'test2'] },
      });

      await cookieStore!.set('test1', 'value1');
      await cookieStore!.set('test2', 'value2');
      await expect.element(screen.getByTestId('cookies-size')).toHaveTextContent('2');

      await cookieStore!.delete('test1');
      await expect.element(screen.getByTestId('cookies-size')).toHaveTextContent('1');
    });
  });

  describe('event listener management', () => {
    it('should subscribe to cache events on mount', async () => {
      const addEventListenerSpy = vi.spyOn(cookieCache, 'addEventListener');

      render(TestUseCookiesComponent, {
        props: { names: ['test1', 'test2'] },
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      addEventListenerSpy.mockRestore();
    });

    it('should unsubscribe from cache events on unmount', async () => {
      const removeEventListenerSpy = vi.spyOn(cookieCache, 'removeEventListener');

      const { unmount } = render(TestUseCookiesComponent, {
        props: { names: ['test1', 'test2'] },
      });

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
