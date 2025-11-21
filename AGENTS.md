# Repository Guidelines

## Project Structure & Module Organization
- `index.html` defines the import map for React, Recharts, Lucide, loads Tailwind via CDN, and mounts `#root`.
- `index.tsx` is the single-page React entry: dashboard UI, mock data generation, Recharts visuals, and Gemini client usage live here.
- `Docs/` contains narrative project stories and requirements; update these when flows change.
- Config: `package.json`, `tsconfig.json`, and `vite.config.ts` cover tooling; env config lives in `.env.local` (see below).

## Build, Test, and Development Commands
- `npm install` — install dependencies.
- `npm run dev` — start Vite dev server (hot reload) at `http://localhost:5173`.
- `npm run build` — production build output in `dist/`.
- `npm run preview` — serve the production build locally for smoke checks.

## Setup & Configuration Tips
- Create `.env.local` with `GEMINI_API_KEY=<your key>`; never commit secrets. Prefer demo/limited-scope keys for local runs.
- The browser loads libraries from the CDN import map; keep versions in `index.html` and `package.json` aligned when upgrading.
- Tailwind is provided via CDN, so utility classes can be used directly in JSX without a build-time processor.

## Coding Style & Naming Conventions
- Language: TypeScript + React functional components; prefer hooks over classes.
- Indentation: 2 spaces; keep JSX props and object literals consistently aligned.
- Components: PascalCase; hooks/utilities: camelCase; files: keep descriptive (e.g., `priceChart.tsx` if splitting).
- Keep UI strings and copy near their components; extract shared data/config constants to dedicated modules if they grow.
- Favor explicit typing on component props and API responses; avoid `any` except when bridging library gaps.

## Testing Guidelines
- No automated tests exist yet; run `npm run preview` or `npm run dev` and validate key flows (chart rendering, mock data generation, Gemini calls gated on API key).
- When adding tests, prefer Vitest + Testing Library (`*.test.tsx`) for UI logic and mocked fetch/gen-AI interactions; aim to keep coverage of new logic >80%.

## Commit & Pull Request Guidelines
- Repository history is not initialized here; use Conventional Commits (`feat:`, `fix:`, `chore:`) for clarity and changelogability.
- PRs should include: summary of changes, testing performed (commands run), screenshots/gifs for UI updates, and any doc updates (including `Docs/`).
- Keep changes scoped and incremental; avoid mixing refactors with feature work unless necessary for the same change.
