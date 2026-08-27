import type { APIRoute } from 'astro';
import { SITE, REPO_URL } from '@/lib/site-meta';

/**
 * /llms.txt — agent-first index (llmstxt.org). Keep this in sync as routes
 * grow; an agent reads this before crawling anything else.
 */
export const GET: APIRoute = () => {
  const body = `# ${SITE.name}

> ${SITE.description}

Source: ${REPO_URL} (${SITE.license}). Agent/contributor context:
${REPO_URL}/blob/main/CLAUDE.md

## Pages (Spanish, default — English mirror under /en/)

- [Inicio](/): consejos antes de zarpar y resumen de progreso
- [Objetos](/items/): armas, herramientas y mejoras, con dónde conseguirlos
- [Corazones](/heart-pieces/): checklist de los 44 Trozos de Corazón
- [Cartas](/charts/): Cartas del Triforce y del Tesoro, con checklist
- [Islas](/islands/): el Gran Mar isla a isla (El Despertar, La Travesía, La Batalla Final)
- [Jefes](/bosses/): referencia rápida de jefes
- [Secundarias](/sidequests/): Laberinto Salvaje, Galería Nintendo, cadena de trueques
- [Modo Héroe](/postgame/): desbloqueables y ruta de completado al 100%
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
