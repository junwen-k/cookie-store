// Setup file for vitest to provide Cookie Store API mock for testing

// Simple Cookie Store API mock for testing
class MockCookieStore extends EventTarget {
  private cookies: Map<string, CookieListItem> = new Map();

  async get(name: string): Promise<CookieListItem | null> {
    return this.cookies.get(name) || null;
  }

  async getAll(): Promise<Array<CookieListItem>> {
    return Array.from(this.cookies.values());
  }

  async set(name: string, value: string): Promise<void>;
  async set(options: CookieInit): Promise<void>;
  async set(nameOrOptions: string | CookieInit, value?: string): Promise<void> {
    const name = typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name;
    const val = typeof nameOrOptions === 'string' ? value! : nameOrOptions.value;

    const cookie: CookieListItem = {
      name,
      value: val,
    };

    this.cookies.set(name, cookie);

    // Dispatch change event
    const event = new Event('change') as CookieChangeEvent;
    (event as any).changed = [cookie];
    (event as any).deleted = [];
    this.dispatchEvent(event);
  }

  async delete(name: string): Promise<void>;
  async delete(options: CookieStoreDeleteOptions): Promise<void>;
  async delete(nameOrOptions: string | CookieStoreDeleteOptions): Promise<void> {
    const name = typeof nameOrOptions === 'string' ? nameOrOptions : nameOrOptions.name!;
    const cookie = this.cookies.get(name);
    if (cookie) {
      this.cookies.delete(name);

      // Dispatch change event
      const event = new Event('change') as CookieChangeEvent;
      (event as any).changed = [];
      (event as any).deleted = [cookie];
      this.dispatchEvent(event);
    }
  }
}

// Install mock Cookie Store API in the global window object
if (typeof window !== 'undefined' && !window.cookieStore) {
  (window as any).cookieStore = new MockCookieStore();
}
