import { Component, InjectionToken, inject } from '@angular/core';

import { injectCookies } from '../inject-cookie';

export const COOKIES_NAME = new InjectionToken<string>('COOKIES_NAME');

@Component({
  selector: 'test-inject-cookies',
  template: `<div data-testid="cookies-length">{{ cookies().length }}</div>`,
})
export class TestInjectCookiesComponent {
  cookies = injectCookies(inject(COOKIES_NAME, { optional: true }) ?? undefined);
}
