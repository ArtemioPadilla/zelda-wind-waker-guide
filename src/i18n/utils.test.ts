import { describe, expect, it } from 'vitest';
import { useTranslations, localizedHref, swapLocaleHref } from './utils';

describe('useTranslations', () => {
  it('returns the key in the requested locale', () => {
    const t = useTranslations('en');
    expect(t('nav.home')).toBe('Home');
  });

  it('returns Spanish for the default locale', () => {
    const t = useTranslations('es');
    expect(t('nav.home')).toBe('Inicio');
  });
});

describe('localizedHref', () => {
  it('leaves the default locale (es) unprefixed', () => {
    expect(localizedHref('es', '/islands/')).toBe('/islands/');
  });

  it('prefixes non-default locales with /en', () => {
    expect(localizedHref('en', '/islands/')).toBe('/en/islands/');
  });

  it('prefixes the root path too', () => {
    expect(localizedHref('en', '/')).toBe('/en/');
  });
});

describe('swapLocaleHref', () => {
  it('adds /en when swapping from es to en', () => {
    expect(swapLocaleHref('en', '/islands/1-1/')).toBe('/en/islands/1-1/');
  });

  it('strips /en when swapping from en to es', () => {
    expect(swapLocaleHref('es', '/en/islands/1-1/')).toBe('/islands/1-1/');
  });

  it('maps /en (no trailing slash) back to the es root', () => {
    expect(swapLocaleHref('es', '/en')).toBe('/');
  });

  it('is idempotent for the root path', () => {
    expect(swapLocaleHref('en', '/')).toBe('/en/');
    expect(swapLocaleHref('es', '/')).toBe('/');
  });
});
