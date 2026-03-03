import { Component, InjectionToken, inject } from '@angular/core';

import { injectCookie } from '../inject-cookie';

export const COOKIE_NAME = new InjectionToken<string>('COOKIE_NAME');

@Component({
  selector: 'test-inject-cookie',
  template: `<div data-testid="cookie-value">{{ cookie()?.value ?? 'null' }}</div>`,
})
export class TestInjectCookieComponent {
  cookie = injectCookie(inject(COOKIE_NAME));
}
