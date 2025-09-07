# Movie Recommendation App - Project Setup & Planning Guide

## Project Overview

**Goal**: Build a movie recommendation app with swipe-based interactions (similar to dating apps) using Next.js 14+, Tamagui v3, and TheMovieDB.org API.

**Tech Stack**:
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: Tamagui v3 components
- **Runtime**: React 18+
- **API**: TheMovieDB.org (TMDB)
- **Environment**: macOS, 16GB RAM

## 🚀 Phase 1: Project Initialization & Setup

### 1.1 Next.js 14+ Project Setup

```bash
# Initialize project with TypeScript
npx create-next-app@latest movie-swipe-app --typescript --app --tailwind --eslint --src-dir

# Navigate to project
cd movie-swipe-app

# Install additional dependencies
npm install @types/node @types/react @types/react-dom
```

**TypeScript Configuration** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### 1.2 Tamagui v3 Integration

```bash
# Install Tamagui core packages
npm install tamagui @tamagui/core @tamagui/config @tamagui/animations-react-native
npm install @tamagui/next-plugin @tamagui/babel-plugin

# Install gesture handling for swipe mechanics
npm install react-native-gesture-handler react-native-reanimated
npm install @react-native-async-storage/async-storage
```

**Tamagui Configuration** (`tamagui.config.ts`):
```typescript
import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

const tamaguiConfig = createTamagui(config)

type Conf = typeof tamaguiConfig
declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

export default tamaguiConfig
```

**Next.js Configuration** (`next.config.js`):
```javascript
const { withTamagui } = require('@tamagui/next-plugin')

module.exports = withTamagui({
  config: './tamagui.config.ts',
  components: ['tamagui'],
  appDir: true,
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
  experimental: {
    optimizeCss: true,
  },
})
```

### 1.3 Project Structure (App Router)

```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx           # Root layout with Tamagui provider
│   ├── page.tsx            # Home page with movie swipe interface
│   ├── api/
│   │   ├── movies/
│   │   │   ├── route.ts    # TMDB API routes
│   │   │   └── discover/
│   │   │       └── route.ts # Movie discovery endpoint
│   │   └── preferences/
│   │       └── route.ts    # User preference management
│   ├── profile/
│   │   └── page.tsx        # User profile and preferences
│   └── recommendations/
│       └── page.tsx        # Personalized recommendations
├── components/
│   ├── ui/
│   │   ├── MovieCard.tsx   # Swipeable movie card component
│   │   ├── SwipeArea.tsx   # Main swipe container
│   │   └── ErrorBoundary.tsx # Error boundary wrapper
│   ├── providers/
│   │   └── TamaguiProvider.tsx
│   └── features/
│       ├── movie-discovery/
│       ├── recommendations/
│       └── user-preferences/
├── lib/
│   ├── tmdb.ts            # TMDB API client
│   ├── preferences.ts     # Preference management logic
│   ├── recommendations.ts # Recommendation algorithm
│   └── utils.ts          # Utility functions
├── types/
│   ├── movie.ts          # Movie-related TypeScript interfaces
│   └── user.ts           # User-related TypeScript interfaces
└── hooks/
    ├── useMovieSwipe.ts  # Swipe gesture logic
    ├── usePreferences.ts # User preference management
    └── useRecommendations.ts # Recommendation fetching
```

## 🎬 Phase 2: TMDB API Integration

### 2.1 API Key Setup

1. Register at [TheMovieDB.org](https://www.themoviedb.org/)
2. Obtain API key from account settings
3. Add to environment variables:

```bash
# .env.local
TMDB_API_KEY=your_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/w500
```

### 2.2 TMDB Client Implementation

**Key Endpoints for Movie Discovery**:
- `/discover/movie` - Discover movies with filters
- `/movie/{movie_id}` - Get movie details
- `/genre/movie/list` - Get movie genres
- `/movie/popular` - Popular movies
- `/search/movie` - Search movies

**API Client** (`lib/tmdb.ts`):
```typescript
interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
}

interface TMDBResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

/**
 * TMDB API client for fetching movie data
 * Implements rate limiting and error handling
 */
class TMDBClient {
  private readonly apiKey: string
  private readonly baseUrl: string
  
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY!
    this.baseUrl = process.env.TMDB_BASE_URL!
  }

  /**
   * Discover movies with optional filters
   */
  async discoverMovies(params: {
    page?: number
    genre?: string
    year?: number
    sortBy?: string
  }): Promise<TMDBResponse<TMDBMovie>> {
    // Implementation with error handling and rate limiting
  }
}
```

## 🎯 Phase 3: Swipe Mechanics & UI Components

### 3.1 Swipe Interaction Design

**Swipe Actions**:
- **Right swipe/click**: Like movie (add to preferences)
- **Left swipe/click**: Dislike movie (negative preference)
- **Up swipe**: Add to watchlist
- **Down swipe**: Not interested

### 3.2 Core Components

**MovieCard Component** (`components/ui/MovieCard.tsx`):
```typescript
'use client'

import { useState } from 'react'
import { Card, Image, Text, YStack, XStack } from 'tamagui'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  runOnJS
} from 'react-native-reanimated'

interface MovieCardProps {
  movie: TMDBMovie
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void
}

/**
 * Swipeable movie card with gesture recognition
 * Optimized for memory efficiency with lazy loading
 */
export const MovieCard: React.FC<MovieCardProps> = ({ movie, onSwipe }) => {
  // Implementation with gesture handling and animations
}
```

**SwipeArea Component** (`components/ui/SwipeArea.tsx`):
```typescript
'use client'

/**
 * Main container for movie swiping interface
 * Manages card stack and preloading for smooth UX
 */
export const SwipeArea: React.FC = () => {
  // Stack management with memory-efficient preloading
  // Error boundary integration
  // Loading states and skeleton components
}
```

## 🧠 Phase 4: Recommendation Algorithm

### 4.1 Preference Tracking

**Data Structure**:
```typescript
interface UserPreferences {
  likedGenres: Record<number, number>     // genre_id: weight
  dislikedGenres: Record<number, number>  // genre_id: weight
  likedActors: Record<number, number>     // actor_id: weight
  preferredYearRange: [number, number]    // [min_year, max_year]
  minRating: number                       // minimum vote_average
  swipeHistory: SwipeAction[]            // historical actions
}

interface SwipeAction {
  movieId: number
  action: 'like' | 'dislike' | 'watchlist' | 'not_interested'
  timestamp: Date
  movieGenres: number[]
}
```

### 4.2 Recommendation Logic

**Algorithm Approach**:
1. **Genre-based scoring**: Weight movies by liked/disliked genres
2. **Collaborative filtering**: Find similar users' preferences
3. **Content-based filtering**: Analyze movie attributes
4. **Temporal decay**: Recent preferences have higher weight
5. **Diversity injection**: Prevent filter bubbles

**Implementation** (`lib/recommendations.ts`):
```typescript
/**
 * Generate personalized movie recommendations
 * Combines multiple recommendation strategies
 * 
 * @param preferences User's current preferences
 * @param excludeIds Movies to exclude from recommendations
 * @param limit Number of recommendations to return
 */
export async function generateRecommendations(
  preferences: UserPreferences,
  excludeIds: number[] = [],
  limit: number = 20
): Promise<TMDBMovie[]> {
  // Multi-strategy recommendation implementation
}
```

## ⚡ Phase 5: Performance & Memory Optimization

### 5.1 Memory Management Strategies

**For 16GB RAM Constraint**:

1. **Lazy Loading**: Load movie data on-demand
2. **Virtual Scrolling**: Render only visible cards
3. **Image Optimization**: Use Next.js Image component with proper sizing
4. **Data Caching**: Implement LRU cache for API responses
5. **Memory Monitoring**: Add development-time memory usage tracking

**Implementation Examples**:

```typescript
// Memory-efficient movie loading
const useMovieQueue = (initialSize: number = 10) => {
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(false)
  
  // Maintain optimal queue size
  const maintainQueue = useCallback(async () => {
    if (movies.length < 5 && !loading) {
      // Load more movies
    }
    
    if (movies.length > 15) {
      // Trim old movies to prevent memory bloat
      setMovies(prev => prev.slice(-10))
    }
  }, [movies.length, loading])
}
```

### 5.2 Error Boundaries

**Global Error Boundary** (`components/ui/ErrorBoundary.tsx`):
```typescript
'use client'

import React from 'react'
import { YStack, Text, Button } from 'tamagui'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary for graceful error handling
 * Provides user-friendly error messages and recovery options
 */
export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  // Implementation with error logging and recovery
}
```

## 📱 Phase 6: Demo Development Roadmap

### 6.1 MVP Demo (Week 1-2)

**Core Features**:
- [x] Project setup with Next.js 14 + Tamagui
- [x] TMDB API integration
- [ ] Basic movie card display
- [ ] Simple swipe/click interactions
- [ ] Basic preference storage (localStorage)
- [ ] Error boundaries for main components

**Deliverables**:
- Working swipe interface with 10-20 popular movies
- Basic like/dislike functionality
- Simple recommendation based on liked genres

### 6.2 Enhanced Demo (Week 3-4)

**Advanced Features**:
- [ ] User authentication (NextAuth.js)
- [ ] Persistent preference storage
- [ ] Advanced recommendation algorithm
- [ ] Watchlist functionality
- [ ] Movie details modal
- [ ] Search functionality

**Deliverables**:
- Personalized recommendations
- User profile management
- Enhanced UI animations

### 6.3 Production-Ready (Week 5-8)

**Production Features**:
- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Advanced analytics and tracking
- [ ] Social features (share recommendations)
- [ ] Performance optimization
- [ ] Comprehensive testing suite
- [ ] Deployment configuration

## 🛠️ Development Guidelines

### Code Quality Standards

1. **Server Components First**: Use Server Components by default
2. **Client Components**: Only when interactivity is required (mark with `'use client'`)
3. **Error Handling**: Wrap all dynamic components in error boundaries
4. **Memory Efficiency**: Monitor and optimize memory usage
5. **JSDoc**: Document all complex functions
6. **TypeScript**: Strict mode enabled, comprehensive type definitions

### File Editing Rules

- Always show full file path in edits
- Indicate changed lines with inline comments
- Preserve all imports and existing functionality
- Test implications of all changes

### Performance Best Practices

1. **Image Optimization**: Use Next.js Image component
2. **Code Splitting**: Implement route-based code splitting
3. **Caching**: Implement proper caching strategies
4. **Bundle Analysis**: Regular bundle size monitoring
5. **Core Web Vitals**: Optimize for LCP, FID, and CLS

## 🔄 Next Steps & Iteration Plan

### Immediate Actions (Next 2-3 days)

1. **Initialize Project**: Set up Next.js with TypeScript
2. **Install Dependencies**: Add Tamagui and gesture handling
3. **API Setup**: Configure TMDB API client
4. **Basic UI**: Create movie card and swipe area components
5. **Error Boundaries**: Implement error handling

### Short-term Goals (Week 1)

1. **MVP Implementation**: Working swipe interface
2. **Basic Recommendations**: Genre-based suggestions
3. **Local Storage**: Preference persistence
4. **Testing**: Unit tests for core components

### Medium-term Goals (Weeks 2-4)

1. **Enhanced Algorithm**: Multi-factor recommendations
2. **User Authentication**: Account management
3. **Advanced UI**: Animations and micro-interactions
4. **Performance Optimization**: Memory and speed improvements

### Long-term Vision (Months 2-3)

1. **Social Features**: Share and discuss movies
2. **Advanced Analytics**: Usage tracking and insights
3. **Machine Learning**: ML-powered recommendations
4. **Mobile App**: React Native version

## 📋 Technical Considerations

### API Rate Limiting
- TMDB allows 40 requests per 10 seconds
- Implement request queuing and caching
- Use batch requests when possible

### Data Storage
- **Phase 1**: localStorage for preferences
- **Phase 2**: Server-side session storage
- **Phase 3**: Database with user accounts

### Responsive Design
- Mobile-first approach with Tamagui
- Touch-friendly swipe gestures
- Keyboard navigation support

### SEO & Performance
- Server-side rendering for movie pages
- Meta tags for social sharing
- Image optimization and lazy loading

## 🚀 Getting Started

To begin development:

1. **Clone/Initialize**: Set up the Next.js project
2. **Environment**: Configure API keys and environment variables
3. **Dependencies**: Install all required packages
4. **Development**: Start with Phase 1 MVP components
5. **Testing**: Implement error boundaries and basic tests

This planning document provides a comprehensive roadmap for building a production-ready movie recommendation app with swipe-based interactions. The phased approach ensures steady progress while maintaining code quality and performance standards.