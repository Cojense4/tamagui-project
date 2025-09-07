## MovieMatch: Next.js 14 + Tamagui v3 + TMDB Planning Guide

This document outlines the setup, architecture, demo roadmap, and next steps for building a movie recommendation app that behaves like a dating app: users swipe or click right/left to like or pass on movies, and recommendations adapt accordingly.

### Objectives
- **Deliverable**: Functioning demo with swiping/clicking, adaptive recommendations, and a clean Tamagui UI.
- **Tech**: Next.js 14+ (App Router), TypeScript (strict), React 18+, Tamagui v3 UI, TMDB API.
- **Guidelines**: Default to Server Components, Client Components only when required; add error boundaries; memory efficient for 16GB RAM; JSDoc for complex functions; follow Next.js performance best practices.

---

## 1) Architecture and Tech Stack Decisions

- **Runtime**: Next.js 14 App Router with React Server Components (RSC) by default; Client Components only for gesture/swipe interactions and local UI state. Route Handlers for server-only API calls and mutations.
- **UI**: Tamagui v3 for cross-platform styled primitives and themes. Prefer Tamagui components over custom CSS.
- **Data source**: TheMovieDB.org (TMDB) REST API. Server-side `fetch` using a server-only key from `.env.local` to avoid exposing credentials.
- **State & storage**:
  - Demo baseline: Single-user session with server-stored preference vector in SQLite (via Prisma) or in-memory store for quickest start.
  - Preferences: Simple genre-weight vector updated by likes/dislikes; use TMDB discover + recommendations endpoints.
- **Recommendation logic (demo)**: Hybrid of (a) TMDB discover feed sorted by popularity with filters and (b) boosts based on liked movie genres. Score = base TMDB popularity + Σ(genreWeight[genre]).
- **Image handling**: `next/image` with TMDB image base URL and responsive sizes; use low-quality placeholders where possible.
- **Caching**: Use Next.js `fetch` cache with `revalidate` windows (e.g., 60–600s) to control API usage; deduplicate requests.
- **Error handling**: Route segment-level `error.tsx` and `loading.tsx`; explicit error boundaries for dynamic Client Components.
- **Security**: Keep TMDB key server-only; add minimal rate limiting in route handlers; validate inputs.
- **Performance**: RSC for data fetching; stream server-rendered UI; avoid large client bundles; code-split gesture component; memoize expensive UI; use Edge runtime for read-only TMDB endpoints if beneficial.

---

## 2) Project Setup (Step-by-step)

### Prerequisites
- Node 18+ LTS, pnpm or npm
- TMDB API key (`https://www.themoviedb.org/`)

### Create the app
```bash
npx create-next-app@latest movie-match \
  --ts --eslint --app --src-dir --import-alias "@/*" --use-pnpm
cd movie-match
```

### Install dependencies
```bash
pnpm add tamagui @tamagui/next-plugin @tamagui/babel-plugin @tamagui/themes @tamagui/config
pnpm add classnames zod
pnpm add -D @types/node @types/react @types/react-dom prisma
pnpm add @prisma/client
# Optional for gestures (can be deferred):
pnpm add react-swipeable
```

### Environment variables
Create `.env.local`:
```bash
TMDB_API_KEY=your_tmdb_api_key
TMDB_API_BASE=https://api.themoviedb.org/3
TMDB_IMAGE_BASE=https://image.tmdb.org/t/p
```

### Next.js + Tamagui integration
- `next.config.mjs` (enable Tamagui plugin, CSS output, and transpilation):
```javascript
import { createTamaguiPlugin } from '@tamagui/next-plugin';

const withTamagui = createTamaguiPlugin({
  config: './tamagui.config.ts',
  components: ['tamagui'],
  outputCSS: true
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prefer server components, enable server actions if needed
    serverActions: { allowedOrigins: ['localhost:3000'] }
  },
  transpilePackages: ['tamagui']
};

export default withTamagui(nextConfig);
```

- `babel.config.js` (Tamagui Babel plugin for optimal extraction):
```javascript
module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@tamagui/babel-plugin',
      { components: ['tamagui'], config: './tamagui.config.ts' }
    ]
  ]
};
```

- `tamagui.config.ts` (minimal theme + fonts):
```ts
import { createTamagui } from 'tamagui';
import { tokens, themes } from '@tamagui/themes';

const config = createTamagui({
  defaultTheme: 'dark',
  shouldAddCssVariables: true,
  themes,
  tokens
});

export type AppConfig = typeof config;
declare module 'tamagui' { interface TamaguiCustomConfig extends AppConfig {} }
export default config;
```

### TypeScript strict settings
- `tsconfig.json` essentials: `"strict": true`, `"noUncheckedIndexedAccess": true`, `"exactOptionalPropertyTypes": true`.

### Prisma (SQLite) for demo persistence
```bash
npx prisma init --datasource-provider sqlite
```
`prisma/schema.prisma` (demo-safe single user):
```prisma
datasource db { provider = "sqlite" url = "file:./dev.db" }
generator client { provider = "prisma-client-js" }

model Swipe {
  id       Int      @id @default(autoincrement())
  movieId  Int
  liked    Boolean
  createdAt DateTime @default(now())
}

model GenreWeight {
  id    Int   @id @default(autoincrement())
  genre Int
  weight Float @default(0)
}
```
Then:
```bash
npx prisma migrate dev -n init
```

---

## 3) Directory Structure (App Router)

```
app/
  layout.tsx
  page.tsx
  error.tsx
  loading.tsx
  (swipe)/
    page.tsx
    error.tsx
    loading.tsx
  api/
    recommendations/route.ts
    swipe/route.ts
components/
  SwipeDeck.tsx
  MovieCard.tsx
  ErrorBoundary.tsx
lib/
  tmdb.ts
  recommend.ts
  prisma.ts
  types.ts
tamagui.config.ts
next.config.mjs
babel.config.js
prisma/schema.prisma
```

---

## 4) Server vs Client Component Plan

- Server: `app/page.tsx`, `app/(swipe)/page.tsx` fetch movie lists and stream UI. `lib/tmdb.ts`, `lib/recommend.ts` are server-only.
- Client: `components/SwipeDeck.tsx` (gesture/swipe), `MovieCard.tsx` (small client piece for animations), any local UI state.
- Shared: Dumb UI primitives from Tamagui that don’t need state can remain server-rendered.

---

## 5) Data Flow & Recommendation Logic

1. Server fetches a candidate pool via TMDB Discover: popular, language filter, optional genre constraints.
2. User likes/passes on a movie.
3. Server updates `GenreWeight` and writes a `Swipe` row.
4. Next candidates are re-ranked using a weighted score: `popularity * alpha + Σ(genreWeight[g]) * beta`.
5. Optionally, when a user likes a movie, merge-in TMDB `movie/{id}/recommendations` to enrich candidates.

Notes:
- Keep candidate pool small (e.g., 40–80) to limit memory; refill incrementally.
- Use `fetch` with `next: { revalidate: 300 }` for stable lists; set `cache: 'no-store'` for user-specific responses.

---

## 6) API and Libraries

- `lib/tmdb.ts`
  - Server-only wrapper around TMDB with base URL and API key.
  - Exposes typed functions: `discoverMovies`, `getMovieRecommendations`, `getGenres`.

- `lib/recommend.ts`
  - Functions to compute genre weights and rank candidates.
  - JSDoc on core scoring functions.

- `app/api/recommendations/route.ts`
  - GET: returns ranked candidates for current session.

- `app/api/swipe/route.ts`
  - POST: body `{ movieId: number, liked: boolean }`; updates weights and swipes.

---

## 7) UI/UX Flow (Tamagui)

- Home: Explain the concept and CTA to start swiping.
- Swipe screen: Card stack with poster, title, genres, rating. Buttons: Pass (Left), Like (Right). Optional drag gestures.
- Feedback: Subtle animations and toasts using Tamagui.
- Accessibility: Keyboard support (←/→), focus states.

---

## 8) Error Boundaries & Loading States

- Add `error.tsx` and `loading.tsx` in each route segment (`/` and `(swipe)`).
- Wrap Client Components with an `ErrorBoundary` component where they fetch or depend on dynamic data.
- Display user-friendly messages and retry controls.

---

## 9) Performance & Memory Practices

- Prefer RSC for data fetching; keep Client Components small and isolated.
- Stream server-rendered content; defer client code with dynamic import.
- Use stable image sizes with `next/image` and `sizes` to reduce layout shift.
- Cache TMDB responses with reasonable `revalidate`; dedupe fetches.
- Keep candidate arrays bounded; garbage-collect old cards.
- Avoid large third-party gesture libs unless needed; start with button clicks.

---

## 10) Demo Feature Scope and Milestones

### Milestone 0 — Project setup
- Create Next.js app with TS strict and Tamagui v3.
- Configure Tamagui plugin, themes, fonts.
- Set up Prisma + SQLite.
- Implement `lib/tmdb.ts` with typed fetchers.

### Milestone 1 — Basic browse/swipe
- Server-render candidate list from TMDB Discover.
- Client `SwipeDeck` with left/right buttons; animate transitions.
- POST `/api/swipe` to record action and update weights.

### Milestone 2 — Adaptive recommendations
- Maintain genre weights in SQLite.
- Rank candidates by score; periodically refresh from TMDB.
- Enrich with `movie/{id}/recommendations` upon likes.

### Milestone 3 — Polish & resilience
- Add error boundaries, loading states, and toasts.
- Optimize image performance; add basic keyboard shortcuts.
- Add minimal tests for scoring and API handlers.

### Milestone 4 — Nice-to-haves (defer if time)
- Drag gestures (react-swipeable) with haptics-like feedback.
- Multi-user with simple auth or cookie-based user id.
- More sophisticated model (content-based vectors or TMDB ratings blending).

---

## 11) Key File Stubs (for implementation)

### `lib/tmdb.ts` (server-only fetch wrapper)
```ts
export type TmdbMovie = {
  id: number;
  title: string;
  overview: string;
  genre_ids: number[];
  poster_path: string | null;
  vote_average: number;
  popularity: number;
};

const TMDB_BASE = process.env.TMDB_API_BASE!;
const TMDB_KEY = process.env.TMDB_API_KEY!;

function tmdbUrl(path: string, query: Record<string, string | number> = {}) {
  const url = new URL(path, TMDB_BASE);
  url.searchParams.set('api_key', TMDB_KEY);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, String(v));
  return url.toString();
}

export async function discoverMovies(page = 1): Promise<TmdbMovie[]> {
  const res = await fetch(tmdbUrl('/discover/movie', { page }), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error('TMDB discover failed');
  const data = await res.json();
  return data.results as TmdbMovie[];
}
```

### `lib/recommend.ts` (genre-weight scoring)
```ts
export type GenreWeights = Record<number, number>;

/**
 * Returns a score for a movie using popularity and genre weights.
 * @param popularity Weight from TMDB (0..1000+)
 * @param genreIds List of TMDB genre ids
 * @param weights Map of genre->weight
 * @param alpha Popularity factor (e.g., 1.0)
 * @param beta Genre boost factor (e.g., 2.5)
 */
export function scoreMovie(
  popularity: number,
  genreIds: number[],
  weights: GenreWeights,
  alpha = 1.0,
  beta = 2.5
): number {
  const genreBoost = genreIds.reduce((sum, g) => sum + (weights[g] ?? 0), 0);
  return popularity * alpha + genreBoost * beta;
}
```

---

## 12) Testing Implications

- Unit test `scoreMovie` with small cases.
- Route handler tests: `/api/recommendations` ranking order, `/api/swipe` updates.
- Manual QA: keyboard support, error boundaries rendering, image performance.

---

## 13) Next Steps Checklist

- Initialize repo and base app; commit baseline.
- Implement Tamagui configuration and basic theme.
- Add TMDB fetchers and `.env.local` values.
- Build `SwipeDeck` with buttons first; wire POST to `/api/swipe`.
- Persist and use genre weights in ranking.
- Add error boundaries and loading states in both `/` and `(swipe)` routes.
- Optimize images and set caching strategies.

---

## 14) Risks and Mitigations

- TMDB rate limits: Cache responses; revalidate at reasonable intervals; small page sizes.
- Client bundle size: Keep gestures optional; code-split `SwipeDeck`.
- Memory limits: Bound candidate arrays; reuse objects; avoid large in-memory caches.
- API key leakage: Server-only calls; never expose key to client.

---

## 15) Command Reference (for convenience)

```bash
# Create app
npx create-next-app@latest movie-match --ts --eslint --app --src-dir --import-alias "@/*" --use-pnpm

# Install deps
pnpm add tamagui @tamagui/next-plugin @tamagui/babel-plugin @tamagui/themes @tamagui/config
pnpm add classnames zod
pnpm add -D prisma @types/node @types/react @types/react-dom
pnpm add @prisma/client

# Prisma
npx prisma init --datasource-provider sqlite
npx prisma migrate dev -n init
```

