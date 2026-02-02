# @cookie-store Project Guidelines

## Project Philosophy

This project provides **reactive Cookie Store API bindings** for different JavaScript frameworks and libraries. Our philosophy centers on:

### 1. **API Design Guidelines**

- **Deliberate, Cautious, and Thoughtful API Design**
  - Prefer well-considered API design over quick or hacky workarounds
  - Strive for API quality and ergonomics on par with Vercel/Next.js libraries

- **Idiomatic Integration**
  - APIs should feel idiomatic to the host framework
  - Ensure usage is clear, predictable, and natural for experienced framework developers

- **Minimal and Consistent Public API**
  - Public APIs must be stable, minimal, and consistent
  - Avoid leaky, surprising, or overly magical patterns

- **Conservative Feature Set**
  - Choose to do less, not more, when in doubt
  - Omit or limit features rather than risk a poor developer experience

### 2. **Thin Abstraction Layer**

- Keep the abstraction layer as **thin and light as possible**
- Avoid unnecessary abstractions or premature optimizations
- Only add functionality that directly supports reactivity
- Do not reinvent browser APIs - proxy and adapt when needed
- `CookieStoreGetOptions` omits `url` as it is only relevant for service workers

### 3. **Native to Browser API**

- Stay as **native as possible** to the [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API)
- Mutations should use the native `window.cookieStore` directly
- Our layer only provides reactive reads, not custom mutation APIs

### 4. **Idiomatic to Each Framework**

- Each library or framework binding must be **idiomatic** to that framework's conventions for integrating external store, for example:

- React: Use [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) (React 18+)
- Vue: Use [shallowRef](https://vuejs.org/guide/extras/reactivity-in-depth.html#integration-with-external-state-systems), [readonly](https://vuejs.org/guide/extras/reactivity-in-depth.html#integration-with-external-state-systems), and the composition API
- Svelte: Use [createSubscriber](https://svelte.dev/docs/svelte/svelte-reactivity#createSubscriber) with Svelte 5 runes
- Preact: Provide both standard [hooks](https://preactjs.com/guide/v10/hooks#stateful-hooks) AND optional [signals](https://preactjs.com/guide/v10/signals/#api)
- Solid: Use [from](https://docs.solidjs.com/reference/reactive-utilities/from) for external store integration

Always refer to each library or framework's documentation for up-to-date information

### 5. **Single Source of Truth**

- `@cookie-store/core` provides a synchronous `CookieStoreCache`
- The cache listens to native `cookieStore` events and re-dispatches them
- All framework bindings subscribe to the core cache, not directly to native API
- This ensures consistency and allows synchronous reads for reactive systems

## Code Quality Standards

### Linting and Formatting

- **ESLint**: All code must pass ESLint checks
- **Prettier**: All code must be formatted with Prettier
- Run `pnpm lint` before committing
- Pre-commit hooks will automatically format and lint staged files

### Testing Requirements

- All framework bindings must have comprehensive tests
- Tests must cover:
  - Reactivity (updates on cookie changes)

### Monorepo Structure

- Use **pnpm workspaces** and **Turbo** for builds
