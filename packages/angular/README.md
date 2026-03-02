# @cookie-store/angular

Idiomatic reactive Angular bindings for the [Cookie Store API](https://developer.mozilla.org/en-US/docs/Web/API/Cookie_Store_API).

## 📦 Installation

```bash
pnpm add @cookie-store/angular
```

## Usage

```ts
import { Component } from '@angular/core';
import { injectCookie } from '@cookie-store/angular';

@Component({
  selector: 'app-root',
  template: `
    <p>{{ session()?.value ?? 'Not logged in' }}</p>
    <button (click)="login()">Login</button>
  `,
})
export class AppComponent {
  session = injectCookie('session');

  async login() {
    await window.cookieStore.set('session', 'token', {
      expires: Date.now() + 86400000,
    });
  }
}
```
