/* v8 ignore start */
export { CookieStoreCache, cookieStoreCache } from './cookie-store-cache';

// Re-export native cookieStore for mutations
export const cookieStore =
  typeof window !== 'undefined' && 'cookieStore' in window ? window.cookieStore : undefined;
/* v8 ignore stop */
