# Getting Started with @cookie-store

This guide will help you set up the development environment and start working with the cookie-store project.

## Prerequisites

- Node.js 24.3.0 or higher
- pnpm 10.12.4 or higher

## Installation

1. Clone the repository:
```bash
cd /Users/junwen-k/Code/junwen@oss/cookie-store
```

2. Install dependencies:
```bash
pnpm install
```

3. Build packages:
```bash
pnpm build
```

4. Run tests:
```bash
pnpm test
```

## Project Structure

```
cookie-store/
├── packages/
│   ├── react/              # React hooks implementation
│   │   ├── src/
│   │   │   ├── use-cookie.ts      # Main implementation
│   │   │   ├── use-cookie.test.ts # Tests
│   │   │   └── index.ts           # Exports
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   └── typescript-config/  # Shared TypeScript configs
├── examples/
│   └── react-vite-demo/   # React demo app
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Development Workflow

### Working on packages

1. Start development mode (watches for changes):
```bash
pnpm dev
```

2. Make changes to package source files

3. Tests run automatically or manually:
```bash
pnpm test
```

### Running examples

1. Navigate to an example:
```bash
cd examples/react-vite-demo
```

2. Start the dev server:
```bash
pnpm dev
```

3. Open http://localhost:5173 in Chrome/Edge (Cookie Store API required)

## Package: @cookie-store/react

### API

#### `useCookie(name: string)`
Reactive hook for reading a single cookie.

```tsx
const session = useCookie('session');
// session: CookieListItem | null
```

#### `useCookies(names?: string[])`
Reactive hook for reading multiple cookies.

```tsx
const cookies = useCookies(['session', 'theme']);
// cookies: Map<string, CookieListItem>
```

#### `cookieStore`
Native Cookie Store API for mutations.

```tsx
// Set cookie
await cookieStore.set('name', 'value', {
  expires: Date.now() + 86400000,
  secure: true,
  sameSite: 'strict'
});

// Delete cookie
await cookieStore.delete('name');
```

## Testing

The library uses Vitest for testing with the following setup:
- **Test environment**: happy-dom (for DOM APIs)
- **Coverage**: v8 provider
- **Type checking**: Enabled with separate tsconfig

Run tests:
```bash
# Run all tests
pnpm test

# Run tests for specific package
cd packages/react
pnpm test

# Watch mode
pnpm test --watch
```

## Building

Build all packages:
```bash
pnpm build
```

The build output will be in each package's `dist/` directory.

## Linting & Formatting

```bash
# Run ESLint
pnpm lint

# Format code
pnpm format
```

## Publishing

1. Create a changeset:
```bash
pnpm changeset
```

2. Version packages:
```bash
pnpm release
```

3. Publish to npm:
```bash
pnpm publish-packages
```

## Browser Support

The Cookie Store API is currently supported in:
- Chrome/Edge 87+
- Opera 73+

Not supported in Firefox or Safari (as of 2026).

The library gracefully handles unsupported browsers by returning `null` or empty collections.

## Contributing

1. Create a new branch
2. Make your changes
3. Add tests
4. Run `pnpm test` and `pnpm build`
5. Create a changeset with `pnpm changeset`
6. Submit a pull request

## Next Steps

- [ ] Implement Vue package (`@cookie-store/vue`)
- [ ] Implement Svelte package (`@cookie-store/svelte`)
- [ ] Implement Solid package (`@cookie-store/solid`)
- [ ] Implement Preact package (`@cookie-store/preact`)
- [ ] Add more examples
- [ ] Add CI/CD workflows
- [ ] Publish to npm

## Troubleshooting

### Cookie Store API not available

The library requires the Cookie Store API which is only available in:
- Chromium-based browsers (Chrome, Edge, Opera)
- Secure contexts (HTTPS or localhost)

For local development, use `http://localhost` (not `http://127.0.0.1`) or HTTPS.

### Tests failing

1. Make sure you're using Node.js 24.3.0+
2. Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
3. Rebuild packages: `pnpm build`

### TypeScript errors

Make sure you're using TypeScript 5.8.3+:
```bash
npx tsc --version
```
