/**
 * User preference type definitions
 */

export interface UserPreferences {
  id?: string
  userId?: string
  favoriteGenres: number[]
  dislikedGenres: number[]
  yearRange: {
    min: number
    max: number
  }
  minimumRating: number
  languages: string[]
  excludeAdult: boolean
  lastUpdated: Date
}

export interface MovieInteraction {
  movieId: number
  action: 'like' | 'dislike' | 'skip'
  timestamp: Date
  genres: number[]
  rating: number
}

export interface RecommendationScore {
  movieId: number
  score: number
  reasons: string[]
}

export interface PreferenceWeights {
  genre: number
  rating: number
  recency: number
  popularity: number
  language: number
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteGenres: [],
  dislikedGenres: [],
  yearRange: {
    min: 2000,
    max: new Date().getFullYear()
  },
  minimumRating: 6.0,
  languages: ['en'],
  excludeAdult: true,
  lastUpdated: new Date()
}

export const DEFAULT_WEIGHTS: PreferenceWeights = {
  genre: 0.4,
  rating: 0.2,
  recency: 0.15,
  popularity: 0.15,
  language: 0.1
}