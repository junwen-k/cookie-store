import { beforeEach, describe, expect, it } from 'vitest';

import { CookieStoreCache, cookieStoreCache } from './cookie-store-cache';

describe('CookieStoreCache', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));
  });

  describe('get', () => {
    it('should return null when cookie does not exist', () => {
      expect(cookieStoreCache.get('nonexistent')).toBeNull();
    });

    it('should return cookie after it is set', async () => {
      await window.cookieStore.set('test', 'value123');

      const cookie = cookieStoreCache.get('test');
      expect(cookie).not.toBeNull();
      expect(cookie?.name).toBe('test');
      expect(cookie?.value).toBe('value123');
    });

    it('should return null after cookie is deleted', async () => {
      await window.cookieStore.set('test', 'value123');

      expect(cookieStoreCache.get('test')).not.toBeNull();

      await window.cookieStore.delete('test');

      expect(cookieStoreCache.get('test')).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no cookies exist', () => {
      expect(cookieStoreCache.getAll()).toEqual([]);
    });

    it('should return all cookies as array', async () => {
      await window.cookieStore.set('cookie1', 'value1');
      await window.cookieStore.set('cookie2', 'value2');
      await window.cookieStore.set('cookie3', 'value3');

      const cookies = cookieStoreCache.getAll();
      expect(cookies.length).toBe(3);

      const cookieMap = new Map(cookies.map((c) => [c.name, c]));
      expect(cookieMap.get('cookie1')?.value).toBe('value1');
      expect(cookieMap.get('cookie2')?.value).toBe('value2');
      expect(cookieMap.get('cookie3')?.value).toBe('value3');
    });
  });

  describe('singleton cookieStoreCache', () => {
    it('should export a singleton instance', () => {
      expect(cookieStoreCache).toBeInstanceOf(CookieStoreCache);
    });

    it('should work with the singleton', async () => {
      await window.cookieStore.set('singleton-test', 'singleton-value');

      const cookie = cookieStoreCache.get('singleton-test');
      expect(cookie?.value).toBe('singleton-value');
    });
  });
});
