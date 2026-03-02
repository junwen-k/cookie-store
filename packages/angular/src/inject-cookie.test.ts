import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  COOKIE_NAME,
  TestInjectCookieComponent,
} from './fixtures/test-inject-cookie.component';
import {
  COOKIES_NAME,
  TestInjectCookiesComponent,
} from './fixtures/test-inject-cookies.component';

describe('injectCookie', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: COOKIE_NAME, useValue: 'test' },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('reactivity', () => {
    it('should return initial state', async () => {
      const fixture = TestBed.createComponent(TestInjectCookieComponent);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();

      await expect.element(page.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should update when cookie is set', async () => {
      const fixture = TestBed.createComponent(TestInjectCookieComponent);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();

      await window.cookieStore.set('test', 'value123');

      await expect.element(page.getByTestId('cookie-value')).toHaveTextContent('value123');
    });

    it('should update when cookie is modified', async () => {
      const fixture = TestBed.createComponent(TestInjectCookieComponent);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();

      await window.cookieStore.set('test', 'initial');
      await expect.element(page.getByTestId('cookie-value')).toHaveTextContent('initial');

      await window.cookieStore.set('test', 'updated');
      await expect.element(page.getByTestId('cookie-value')).toHaveTextContent('updated');
    });

    it('should update when cookie is deleted', async () => {
      const fixture = TestBed.createComponent(TestInjectCookieComponent);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();

      await window.cookieStore.set('test', 'value123');
      await expect.element(page.getByTestId('cookie-value')).toHaveTextContent('value123');

      await window.cookieStore.delete('test');
      await expect.element(page.getByTestId('cookie-value')).toHaveTextContent('null');
    });

    it('should not update for different cookie changes', async () => {
      await window.cookieStore.set('test', 'value123');

      const fixture = TestBed.createComponent(TestInjectCookieComponent);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();

      await expect.element(page.getByTestId('cookie-value')).toHaveTextContent('value123');

      await window.cookieStore.set('other', 'otherValue');

      await expect.element(page.getByTestId('cookie-value')).toHaveTextContent('value123');
    });
  });
});

describe('injectCookies', () => {
  beforeEach(async () => {
    const allCookies = await window.cookieStore.getAll();
    await Promise.all(allCookies.map((cookie) => window.cookieStore.delete(cookie.name!)));

    TestBed.resetTestingModule();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('reactivity', () => {
    it('should return initial empty state', async () => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
      });
      const fixture = TestBed.createComponent(TestInjectCookiesComponent);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();

      await expect.element(page.getByTestId('cookies-length')).toHaveTextContent('0');
    });

    it('should update when cookies are set', async () => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
      });
      const fixture = TestBed.createComponent(TestInjectCookiesComponent);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();

      await window.cookieStore.set('test1', 'value1');
      await expect.element(page.getByTestId('cookies-length')).toHaveTextContent('1');

      await window.cookieStore.set('test2', 'value2');
      await expect.element(page.getByTestId('cookies-length')).toHaveTextContent('2');
    });

    it('should filter by name when provided', async () => {
      await window.cookieStore.set('test1', 'value1');
      await window.cookieStore.set('test2', 'value2');

      TestBed.configureTestingModule({
        providers: [
          provideZonelessChangeDetection(),
          { provide: COOKIES_NAME, useValue: 'test1' },
        ],
      });
      const fixture = TestBed.createComponent(TestInjectCookiesComponent);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();

      await expect.element(page.getByTestId('cookies-length')).toHaveTextContent('1');
    });

    it('should return all cookies when no name provided', async () => {
      await window.cookieStore.set('test1', 'value1');
      await window.cookieStore.set('test2', 'value2');
      await window.cookieStore.set('test3', 'value3');

      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
      });
      const fixture = TestBed.createComponent(TestInjectCookiesComponent);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();

      await expect.element(page.getByTestId('cookies-length')).toHaveTextContent('3');
    });

    it('should update when cookie is deleted', async () => {
      TestBed.configureTestingModule({
        providers: [provideZonelessChangeDetection()],
      });
      const fixture = TestBed.createComponent(TestInjectCookiesComponent);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();

      await window.cookieStore.set('test1', 'value1');
      await window.cookieStore.set('test2', 'value2');
      await expect.element(page.getByTestId('cookies-length')).toHaveTextContent('2');

      await window.cookieStore.delete('test1');
      await expect.element(page.getByTestId('cookies-length')).toHaveTextContent('1');
    });
  });
});
