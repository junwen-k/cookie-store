/**
 * Synchronous cache for Cookie Store API.
 * Maintains an in-memory mirror of cookies as a stable array & provides synchronous read access.
 */
export class CookieStoreCache {
  #cookies: CookieList = [];

  constructor() {
    // Only initialize in browser with Cookie Store API support
    if (typeof window !== 'undefined' && 'cookieStore' in window) {
      this.#initialize();
    }
  }

  async #initialize() {
    try {
      this.#initializeCookies();
    } catch {
      // Do nothing
    }
    this.#initializeListeners();
  }

  async #initializeCookies() {
    const cookies = await window.cookieStore.getAll();
    this.#cookies.length = 0;
    for (const cookie of cookies) {
      this.#cookies.push(cookie);
    }
  }

  #initializeListeners() {
    window.cookieStore.addEventListener('change', this.#handleChange);
  }

  #handleChange = (event: CookieChangeEvent) => {
    event.changed?.forEach((cookie) => {
      const index = this.#cookies.findIndex((c) => c.name === cookie.name);
      if (index !== -1) {
        this.#cookies[index] = cookie;
      } else {
        this.#cookies.push(cookie);
      }
    });

    event.deleted?.forEach((cookie) => {
      const index = this.#cookies.findIndex((c) => c.name === cookie.name);
      if (index !== -1) {
        this.#cookies.splice(index, 1);
      }
    });
  };

  get(name: string): CookieListItem | null {
    return this.#cookies.find((cookie) => cookie.name === name) ?? null;
  }

  getAll(name?: string): CookieList {
    if (name) {
      return this.#cookies.filter((cookie) => cookie.name === name);
    }
    return this.#cookies;
  }

  addEventListener(...args: Parameters<typeof window.cookieStore.addEventListener>): void {
    window.cookieStore?.addEventListener(...args);
  }

  removeEventListener(...args: Parameters<typeof window.cookieStore.removeEventListener>): void {
    window.cookieStore?.removeEventListener(...args);
  }
}

export const cookieStoreCache = new CookieStoreCache();
