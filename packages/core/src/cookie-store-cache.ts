/**
 * Synchronous cache for the Cookie Store API using an immutable-on-write pattern.
 * Maintains an in-memory mirror of cookies for synchronous read access.
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
      await this.#initializeCookies();
    } catch {
      // Do nothing
    }
    this.#initializeListeners();
  }

  async #initializeCookies() {
    const cookies = await window.cookieStore.getAll();

    this.#cookies = [...cookies];
  }

  #initializeListeners() {
    window.cookieStore.addEventListener('change', this.#handleChange);
  }

  #handleChange = (event: CookieChangeEvent) => {
    let nextCookies = [...this.#cookies];

    event.changed.forEach((changed) => {
      const index = nextCookies.findIndex((c) => c.name === changed.name);
      if (index !== -1) {
        nextCookies[index] = changed;
      } else {
        nextCookies.push(changed);
      }
    });

    event.deleted.forEach((deleted) => {
      nextCookies = nextCookies.filter((c) => c.name !== deleted.name);
    });

    this.#cookies = nextCookies;
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
