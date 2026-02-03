# @cookie-store — Agent Guidelines

This file gives AI agents project-specific rules, constraints, and workflows for **@cookie-store**: reactive [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API) bindings for JavaScript frameworks. Follow it when editing code, adding features, or writing tests.

---

## Project philosophy

- **What we build**: Thin, reactive bindings on top of the native Cookie Store API. We do not replace or wrap mutation APIs; we only provide reactive reads. Mutations use `window.cookieStore` directly.
- **How we build**: API design is deliberate and conservative. We prefer minimal, stable, framework-idiomatic APIs over extra features or magic.

---

## Do

- Design APIs to feel idiomatic in each framework (React, Vue, Svelte, Preact, Solid).
- Keep the public API minimal, stable, and consistent.
- Keep the abstraction layer thin: only what’s needed for reactivity; proxy/adapt the browser API, don’t reinvent it.
- Align API quality and ergonomics with well-regarded libraries (e.g. Vercel/Next.js style).
- Use **pnpm workspaces** and **Turbo** for the monorepo.
- Run `pnpm lint` before committing; pre-commit hooks format and lint staged files.
- Omit `url` from `CookieStoreGetOptions` surface in docs/APIs meant for main thread (it’s for service workers only).

## Don’t

- Add custom mutation APIs; use the native Cookie Store API for writes.
- Introduce leaky, surprising, or overly magical patterns.
- Add features “just in case”; when in doubt, do less.

---

## Architecture

### Single source of truth

- **@cookie-store/core** exposes a synchronous **CookieStoreCache**.
- The cache subscribes to the native `cookieStore` and re-dispatches events.
- All framework bindings subscribe to this core cache, not directly to the native API.
- This keeps reads synchronous and consistent for reactive systems.

### Framework bindings (idiomatic integration)

Each binding must follow that framework’s recommended way to integrate external stores:

| Framework | Use                                                                                                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React     | [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore) (React 18+)                                                                                                                                                  |
| Vue       | [shallowRef](https://vuejs.org/guide/extras/reactivity-in-depth.html#integration-with-external-state-systems), [readonly](https://vuejs.org/guide/extras/reactivity-in-depth.html#integration-with-external-state-systems), Composition API |
| Svelte    | [createSubscriber](https://svelte.dev/docs/svelte/svelte-reactivity#createSubscriber) with Svelte 5 runes                                                                                                                                   |
| Preact    | Standard [hooks](https://preactjs.com/guide/v10/hooks#stateful-hooks) and optional [signals](https://preactjs.com/guide/v10/signals/#api)                                                                                                   |
| Solid     | [from](https://docs.solidjs.com/reference/reactive-utilities/from) for external store integration                                                                                                                                           |

Always double-check the official docs for the framework you’re editing; conventions can change.

---

## Code quality

### Linting and formatting

- **ESLint**: All code must pass ESLint.
- **Prettier**: All code must be formatted with Prettier.
- Run `pnpm lint` before committing.

### Testing

- Every framework binding must have tests.
- Tests must cover **reactivity** (e.g. updates when cookies change).
- Prefer adding or updating tests when changing behavior.

### Commands (prefer scoped when possible)

- Lint: `pnpm lint` (or lint a single package via Turbo/filter if configured).
- Typecheck: run the typecheck script for the package you changed.
- Test: run tests for the package you changed (e.g. `pnpm --filter @cookie-store/<pkg> test` or equivalent).
- Full build: only when necessary (e.g. before release or when explicitly asked).

---

## When unsure

- Prefer a small, focused change and a short summary of what and why.
- If requirements are ambiguous, ask or propose a short plan instead of making large speculative edits.
- Do not install new dependencies, run full monorepo builds, or push without explicit approval unless the user clearly asks for it.
