import { beforeEach, describe, expect, it } from 'vitest';

import { CookieStoreCache, cookieCache } from './cookie-store-cache';

describe('CookieStoreCache', () => {
  beforeEach(async () => {
    const cookies = await window.cookieStore.getAll();
    await Promise.all(cookies.map((cookie) => window.cookieStore.delete(cookie.name!)));
  });

  describe('get', () => {
    it('should return null when cookie does not exist', () => {
      expect(cookieCache.get('nonexistent')).toBeNull();
    });

    it('should return cookie after it is set', async () => {
      await window.cookieStore.set('test', 'value123');

      const cookie = cookieCache.get('test');
      expect(cookie).not.toBeNull();
      expect(cookie?.name).toBe('test');
      expect(cookie?.value).toBe('value123');
    });

    it('should return null after cookie is deleted', async () => {
      await window.cookieStore.set('test', 'value123');

      expect(cookieCache.get('test')).not.toBeNull();

      await window.cookieStore.delete('test');

      expect(cookieCache.get('test')).toBeNull();
    });
  });

  describe('getAll', () => {
    it('should return empty array when no cookies exist', () => {
      expect(cookieCache.getAll()).toEqual([]);
    });

    it('should return all cookies as array', async () => {
      await window.cookieStore.set('cookie1', 'value1');
      await window.cookieStore.set('cookie2', 'value2');
      await window.cookieStore.set('cookie3', 'value3');

      const cookies = cookieCache.getAll();
      expect(cookies.length).toBe(3);

      const cookieMap = new Map(cookies.map((c) => [c.name, c]));
      expect(cookieMap.get('cookie1')?.value).toBe('value1');
      expect(cookieMap.get('cookie2')?.value).toBe('value2');
      expect(cookieMap.get('cookie3')?.value).toBe('value3');
    });
  });

  describe('isReady', () => {
    it('should return true after initialization', async () => {
      expect(cookieCache.isReady()).toBe(true);
    });
  });

  describe('singleton cookieCache', () => {
    it('should export a singleton instance', () => {
      expect(cookieCache).toBeInstanceOf(CookieStoreCache);
    });

    it('should work with the singleton', async () => {
      await window.cookieStore.set('singleton-test', 'singleton-value');

      const cookie = cookieCache.get('singleton-test');
      expect(cookie?.value).toBe('singleton-value');
    });
  });
});
