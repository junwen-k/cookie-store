import '@ungap/with-resolvers';

// Mock Cookie Store API for happy-dom
class MockCookieStore extends EventTarget {
  private cookies: Map<string, CookieListItem> = new Map();

  async get(name: string): Promise<CookieListItem | null> {
    return this.cookies.get(name) ?? null;
  }

  async getAll(name?: string): Promise<CookieList> {
    if (name) {
      const cookie = this.cookies.get(name);
      return cookie ? [cookie] : [];
    }
    return Array.from(this.cookies.values());
  }

  async set(name: string, value: string): Promise<void> {
    const oldCookie = this.cookies.get(name);
    const newCookie: CookieListItem = {
      name,
      value,
      domain: null,
      path: '/',
      expires: null,
      secure: false,
      sameSite: 'lax',
    };

    this.cookies.set(name, newCookie);

    const event = new Event('change') as CookieChangeEvent;
    (event as any).changed = [newCookie];
    (event as any).deleted = oldCookie ? [] : [];
    this.dispatchEvent(event);
  }

  async delete(name: string): Promise<void> {
    const cookie = this.cookies.get(name);
    if (cookie) {
      this.cookies.delete(name);

      const event = new Event('change') as CookieChangeEvent;
      (event as any).changed = [];
      (event as any).deleted = [cookie];
      this.dispatchEvent(event);
    }
  }
}

if (typeof window !== 'undefined' && !('cookieStore' in window)) {
  Object.defineProperty(window, 'cookieStore', {
    value: new MockCookieStore(),
    writable: true,
    configurable: true,
  });
}
