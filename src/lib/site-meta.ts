/**
 * SINGLE SOURCE of this site's machine-readable identity (llms.txt,
 * JSON-LD, default meta description).
 */
export const SITE = {
  name: 'WW Guía',
  description:
    'Guía y tracker offline de The Legend of Zelda: The Wind Waker HD: el Gran Mar isla a isla, mazmorras, Trozos de Corazón, Cartas del Triforce, objetos clave y jefes.',
  repoSlug:
    (import.meta.env.PUBLIC_REPO_SLUG as string | undefined) ?? 'ArtemioPadilla/zelda-wind-waker-guide',
  license: 'MIT',
} as const;

export const REPO_URL = `https://github.com/${SITE.repoSlug}`;
