# API Design Comparison

## Philosophy: Thin Reactive Layer over Native Cookie Store API

### Option 1: Read-Only Hooks + Native Mutations (Recommended)

```typescript
// React Example
const session = useCookie('session');
const theme = useCookie('theme');
const preferences = useCookies(['lang', 'timezone']);

// Mutations use native API directly
await cookieStore.set('session', 'token123', {
  expires: Date.now() + 86400000,
  secure: true,
  sameSite: 'strict'
});

await cookieStore.delete('theme');
```

**Pros:**
- ✅ Zero abstraction over native API
- ✅ Users learn the real Cookie Store API
- ✅ No API surface duplication
- ✅ Smallest bundle size
- ✅ Perfect alignment with "thin layer" philosophy
- ✅ Clear separation: hooks = reactive reads, native API = writes
- ✅ Less code to maintain and test

**Cons:**
- ❌ Mutations not part of hook return value (could feel disconnected)
- ❌ Users must import both hook and `cookieStore`
- ❌ No type narrowing for cookie name in mutations

### Option 2: Tuple Return (useState-like)

```typescript
// React Example
const [session, setSession, deleteSession] = useCookie('session');
const [theme, setTheme, deleteTheme] = useCookie('theme');

// Mutations through returned functions
await setSession('token123', {
  expires: Date.now() + 86400000,
  secure: true,
  sameSite: 'strict'
});

await deleteSession();
```

**Pros:**
- ✅ Familiar `useState` pattern
- ✅ Cookie name automatically bound to mutations
- ✅ Everything in one return value
- ✅ Type-safe - cookie name enforced

**Cons:**
- ❌ Duplicates native API with wrapper functions
- ❌ Hides the native API from users
- ❌ Larger bundle size (wrapper functions)
- ❌ Doesn't teach users the real Cookie Store API
- ❌ More code to maintain

### Option 3: Object Return (react-cookie-like)

```typescript
// React Example
const { cookie: session, set: setSession, delete: deleteSession } = useCookie('session');

await setSession('token123', {
  expires: Date.now() + 86400000,
  secure: true,
  sameSite: 'strict'
});
```

**Pros:**
- ✅ Everything in one return value
- ✅ Named properties (clearer than tuple)

**Cons:**
- ❌ Same as Option 2
- ❌ Verbose destructuring

## Recommendation: Option 1 (Read-Only + Native API)

### Why Option 1 is Best:

1. **Aligns with stated philosophy**: "very thin layer of abstraction that makes Cookie Store reactive"

2. **Teaches the native API**: Developers learn `cookieStore.set()` / `.delete()` which works everywhere

3. **Smaller surface area**: 
   - Option 1: 2 functions (`useCookie`, `useCookies`)
   - Option 2/3: Same 2 functions + wrapper implementations

4. **Better for advanced use cases**: Native API is more powerful and fully typed

5. **Consistent with modern patterns**: Similar to how you'd use `localStorage` with a reactive wrapper

### Counter-argument: Won't users expect mutations in the hook?

**Response**: Not necessarily. Consider these precedents:

```typescript
// React Query - data fetching is separate from mutations
const { data } = useQuery('key');
mutate({ ... });

// Zustand - reading vs writing
const bears = useStore(state => state.bears);
useStore.setState({ bears: 5 });

// Jotai - atoms have separate read/write
const count = useAtomValue(countAtom);
setAtom(countAtom, 5);
```

The pattern of "read via hook, write via separate API" is well-established.

## Implementation Complexity

### Option 1 (Minimal):
```typescript
// ~30 lines of code
function useCookie(name: string): CookieListItem | null {
  const subscribe = (callback: () => void) => {
    if (!cookieStore) return () => {};
    const listener = (event: CookieChangeEvent) => {
      const affected = [...event.changed, ...event.deleted]
        .some(cookie => cookie.name === name);
      if (affected) callback();
    };
    cookieStore.addEventListener('change', listener);
    return () => cookieStore.removeEventListener('change', listener);
  };
  
  const getSnapshot = () => {
    // Fetch and cache
  };
  
  return useSyncExternalStore(subscribe, getSnapshot, () => null);
}

export { cookieStore };
```

### Option 2 (Wrappers):
```typescript
// ~50+ lines of code
function useCookie(name: string): [
  CookieListItem | null,
  (value: string, options?: CookieInit) => Promise<void>,
  (options?: CookieStoreDeleteOptions) => Promise<void>
] {
  // Same subscription logic as above...
  
  const cookie = useSyncExternalStore(subscribe, getSnapshot, () => null);
  
  // Additional wrapper functions
  const setCookie = useCallback(async (value: string, options?: CookieInit) => {
    if (!cookieStore) throw new Error('Cookie Store API not available');
    await cookieStore.set({ name, value, ...options });
  }, [name]);
  
  const deleteCookie = useCallback(async (options?: CookieStoreDeleteOptions) => {
    if (!cookieStore) throw new Error('Cookie Store API not available');
    await cookieStore.delete({ name, ...options });
  }, [name]);
  
  return [cookie, setCookie, deleteCookie];
}
```

**Result**: Option 1 is 40% less code with identical functionality.

## Developer Experience Comparison

### Scenario: User authentication

**Option 1 (Recommended):**
```typescript
import { useCookie, cookieStore } from '@cookie-store/react';

function Auth() {
  const session = useCookie('session');
  
  const login = async (token: string) => {
    await cookieStore.set('session', token, {
      expires: Date.now() + 86400000,
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
  };
  
  const logout = async () => {
    await cookieStore.delete('session');
  };
  
  return <div>{session?.value}</div>;
}
```

**Option 2:**
```typescript
import { useCookie } from '@cookie-store/react';

function Auth() {
  const [session, setSession, deleteSession] = useCookie('session');
  
  const login = async (token: string) => {
    await setSession(token, {
      expires: Date.now() + 86400000,
      secure: true,
      sameSite: 'strict',
      path: '/'
    });
  };
  
  const logout = async () => {
    await deleteSession();
  };
  
  return <div>{session?.value}</div>;
}
```

**Analysis**: Option 2 is slightly shorter but hides the native API. Option 1 makes it clear you're using the Cookie Store API.

### Scenario: Multiple cookies

**Option 1:**
```typescript
const auth = useCookie('session');
const theme = useCookie('theme');
const lang = useCookie('lang');

// Clear all
await Promise.all([
  cookieStore.delete('session'),
  cookieStore.delete('theme'),
  cookieStore.delete('lang')
]);
```

**Option 2:**
```typescript
const [auth, setAuth, deleteAuth] = useCookie('session');
const [theme, setTheme, deleteTheme] = useCookie('theme');
const [lang, setLang, deleteLang] = useCookie('lang');

// Clear all
await Promise.all([
  deleteAuth(),
  deleteTheme(),
  deleteLang()
]);
```

**Analysis**: Option 2 gets verbose with multiple cookies. Option 1 is cleaner.

## Final Recommendation

**Use Option 1: Read-only hooks + native mutations**

This best serves the project goals:
- Thin abstraction layer ✅
- Teaches native API ✅
- Minimal maintenance ✅
- Smallest bundle ✅
- Maximum flexibility ✅

The pattern is proven, the code is simpler, and it perfectly aligns with the stated philosophy.
