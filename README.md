# WW Guía

Guía y tracker offline (PWA, ES/EN) de *The Legend of Zelda: The Wind Waker*
HD (Wii U / Switch vía NSO): objetos y equipo, los 44 Trozos de Corazón,
Cartas del Triforce y del Tesoro, el Gran Mar isla a isla, jefes, secundarias
y Modo Héroe. Los checklists de corazones/cartas y la isla actual se guardan
en el dispositivo (IndexedDB) — sin cuentas, sin backend, funciona sin
conexión una vez instalada.

```bash
npm install
npm run dev      # http://localhost:4321
npm run check    # gate: astro check + type-check + tests + build
```

Sibling project to [resident-evil-4-guide](https://github.com/ArtemioPadilla/resident-evil-4-guide),
hand-built to match its architecture (see `CLAUDE.md`) with a distinct
Great-Sea visual identity — see `docs/decisions/0001-great-sea-palette-contrast.md`.
