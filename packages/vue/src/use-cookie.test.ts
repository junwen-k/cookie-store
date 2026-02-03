import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-vue';

import TestUseCookieComponent from './fixtures/test-use-cookie.vue';
import TestUseCookiesComponent from './fixtures/test-use-cookies.vue';

describe('useCookie', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));
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

      await window.cookieStore.set('test', 'value123');

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('value123');
    });

    it('should update when cookie is modified', async () => {
      const screen = render(TestUseCookieComponent, {
        props: { name: 'test' },
      });

      await window.cookieStore.set('test', 'initial');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('initial');

      await window.cookieStore.set('test', 'updated');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('updated');
    });

    it('should update when cookie is deleted', async () => {
      const screen = render(TestUseCookieComponent, {
        props: { name: 'test' },
      });

      await window.cookieStore.set('test', 'value123');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('value123');

      await window.cookieStore.delete('test');
      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should not update for different cookie changes', async () => {
      await window.cookieStore.set('test', 'value123');

      const screen = render(TestUseCookieComponent, {
        props: { name: 'test' },
      });

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('value123');

      await window.cookieStore.set('other', 'otherValue');

      await expect.element(screen.getByTestId('cookie-value')).toHaveTextContent('value123');
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

  describe('reactivity', () => {
    it('should return initial empty state', async () => {
      const screen = render(TestUseCookiesComponent, {
        props: {},
      });

      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('0');
    });

    it('should update when cookies are set', async () => {
      const screen = render(TestUseCookiesComponent, {
        props: {},
      });

      await window.cookieStore.set('test1', 'value1');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('1');

      await window.cookieStore.set('test2', 'value2');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('2');
    });

    it('should filter by name when provided', async () => {
      await window.cookieStore.set('test1', 'value1');
      await window.cookieStore.set('test2', 'value2');

      const screen = render(TestUseCookiesComponent, {
        props: { name: 'test1' },
      });

      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('1');
    });

    it('should return all cookies when no name provided', async () => {
      await window.cookieStore.set('test1', 'value1');
      await window.cookieStore.set('test2', 'value2');
      await window.cookieStore.set('test3', 'value3');

      const screen = render(TestUseCookiesComponent, {
        props: {},
      });

      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('3');
    });

    it('should update when cookie is deleted', async () => {
      const screen = render(TestUseCookiesComponent, {
        props: {},
      });

      await window.cookieStore.set('test1', 'value1');
      await window.cookieStore.set('test2', 'value2');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('2');

      await window.cookieStore.delete('test1');
      await expect.element(screen.getByTestId('cookies-length')).toHaveTextContent('1');
    });
  });
});
