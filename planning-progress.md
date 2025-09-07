# Movie Recommendation App - Project Planning Guide

## Project Overview

A movie recommendation app built with Next.js 14+, Tamagui v3, and TheMovieDB.org API. The app functions like a dating app for movies - users swipe or click to indicate interest, and the system adapts recommendations based on their preferences.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **UI Library**: Tamagui v3
- **React Version**: 18+
- **External API**: TheMovieDB.org (TMDB)
- **State Management**: React Context + Server State
- **Styling**: Tamagui components (minimal custom CSS)

## Project Structure

```
movie-swipe-app/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with Tamagui provider
│   ├── page.tsx             # Landing page
│   ├── swipe/               # Main swipe interface
│   │   ├── page.tsx         # Server component
│   │   └── components/      # Client components
│   ├── preferences/         # User preferences page
│   ├── api/                 # API routes
│   │   ├── movies/          # Movie endpoints
│   │   └── preferences/     # Preference endpoints
│   └── error.tsx            # Global error boundary
├── components/              # Shared components
│   ├── ui/                  # Tamagui-based UI components
│   ├── cards/               # Movie card components
│   └── layouts/             # Layout components
├── lib/                     # Utilities and helpers
│   ├── tmdb/                # TMDB API client
│   ├── preferences/         # Preference logic
│   └── utils/               # General utilities
├── types/                   # TypeScript definitions
├── public/                  # Static assets
└── config/                  # Configuration files

```

## Setup Instructions

### 1. Initialize Project

```bash
npx create-next-app@latest movie-swipe-app --typescript --app --tailwind
cd movie-swipe-app
```

### 2. Install Dependencies

```bash
# Core dependencies
npm install @tamagui/core @tamagui/animations-react-native @tamagui/themes
npm install @tamagui/next-plugin

# Additional UI components
npm install @tamagui/lucide-icons @tamagui/toast

# Utilities
npm install axios swr zustand
npm install framer-motion

# Development dependencies
npm install -D @types/node
```

### 3. Configure TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 4. Configure Next.js for Tamagui (next.config.js)

```javascript
const { withTamagui } = require('@tamagui/next-plugin')

const tamaguiConfig = {
  config: './tamagui.config.ts',
  components: ['@tamagui/core'],
  appDir: true,
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
}

module.exports = withTamagui(nextConfig, tamaguiConfig)
```

### 5. Environment Variables (.env.local)

```env
# TMDB API Configuration
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
NEXT_PUBLIC_TMDB_BASE_URL=https://api.themoviedb.org/3
NEXT_PUBLIC_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Core Components Architecture

### 1. Movie Card Component
- Server component for initial data
- Client component for interactions
- Swipe gestures using Framer Motion
- Like/Dislike buttons as fallback

### 2. Recommendation Engine
- Initial: Popular movies
- Tracks genre preferences
- Weighted scoring based on user actions
- Server-side filtering for performance

### 3. Preference Management
- Local storage for demo
- Server API ready for future database
- Preference categories:
  - Genres
  - Release year range
  - Rating threshold
  - Language preferences

### 4. UI Components (Tamagui)
- Card: Movie display container
- Button: Action buttons
- Stack: Layout management
- Sheet: Preference panel
- Toast: Feedback messages

## API Integration Strategy

### TMDB API Endpoints

1. **Discover Movies**: `/discover/movie`
   - Initial movie pool
   - Filter by genre, year, rating

2. **Movie Details**: `/movie/{movie_id}`
   - Full movie information
   - Cast and crew data

3. **Genres**: `/genre/movie/list`
   - Genre mapping
   - Preference options

### Data Flow

```
User Action → Client Component → API Route → TMDB API
     ↓                                           ↓
Preference Update ← State Management ← Processed Data
```

## Memory Optimization Strategies

1. **Image Optimization**
   - Use Next.js Image component
   - Lazy loading
   - Appropriate sizing (w500 for cards)

2. **Data Management**
   - Paginated API calls
   - Limited movie queue (10-20 movies)
   - Clear processed movies from memory

3. **Component Optimization**
   - Server Components for static parts
   - Dynamic imports for heavy components
   - Memoization for expensive computations

## Demo Roadmap

### Phase 1: Core Setup (Day 1)
- [x] Project initialization
- [ ] Tamagui configuration
- [ ] Basic layout structure
- [ ] TMDB API client setup

### Phase 2: Basic UI (Day 2)
- [ ] Movie card component
- [ ] Swipe interface layout
- [ ] Basic navigation
- [ ] Error boundaries

### Phase 3: Core Functionality (Day 3-4)
- [ ] Swipe gesture implementation
- [ ] Like/Dislike actions
- [ ] Movie queue management
- [ ] Basic preference tracking

### Phase 4: Recommendations (Day 5)
- [ ] Preference algorithm
- [ ] Genre-based filtering
- [ ] Recommendation API
- [ ] Results display

### Phase 5: Polish & Testing (Day 6-7)
- [ ] UI animations
- [ ] Loading states
- [ ] Error handling
- [ ] Performance optimization
- [ ] Basic testing

## Next Steps After Demo

### 1. Authentication
- NextAuth.js integration
- User profiles
- Persistent preferences

### 2. Advanced Features
- Collaborative filtering
- Watch history
- Social features (share recommendations)
- Watchlist management

### 3. Performance Enhancements
- Redis caching
- Database integration (PostgreSQL)
- CDN for static assets
- Service worker for offline

### 4. Deployment
- Vercel deployment
- Environment configuration
- Monitoring setup
- Analytics integration

## Development Guidelines

### Code Standards
```typescript
// Use JSDoc for complex functions
/**
 * Calculates movie recommendation score based on user preferences
 * @param movie - Movie object from TMDB
 * @param preferences - User preference object
 * @returns Normalized score between 0-1
 */
function calculateRecommendationScore(
  movie: TMDBMovie,
  preferences: UserPreferences
): number {
  // Implementation
}
```

### Component Pattern
```typescript
// Server Component (default)
export default async function MovieList() {
  const movies = await fetchMovies()
  return <MovieGrid movies={movies} />
}

// Client Component (only when needed)
'use client'
export function SwipeableCard({ movie }: { movie: Movie }) {
  // Interactive logic here
}
```

### Error Handling
```typescript
// Always wrap dynamic components
<ErrorBoundary fallback={<ErrorFallback />}>
  <DynamicComponent />
</ErrorBoundary>
```

## Testing Strategy

### Unit Tests
- Preference algorithm
- Utility functions
- API client methods

### Integration Tests
- API routes
- Component interactions
- Data flow

### E2E Tests
- User journey
- Swipe interactions
- Preference updates

## Performance Metrics

Target metrics for demo:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Cumulative Layout Shift: < 0.1
- Memory usage: < 500MB active

## Conclusion

This guide provides a comprehensive roadmap for building a movie recommendation app with Next.js 14+, Tamagui v3, and TMDB API. The phased approach ensures a working demo can be delivered quickly while maintaining code quality and planning for future enhancements.

Start with Phase 1 and progress systematically. Each phase builds upon the previous, ensuring a stable foundation for the final product.