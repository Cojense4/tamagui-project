/**
 * Preference Manager
 * Handles user preference storage and updates based on movie interactions
 */

import { 
  UserPreferences, 
  MovieInteraction, 
  DEFAULT_PREFERENCES,
  TMDBMovie,
  PreferenceWeights,
  DEFAULT_WEIGHTS,
  RecommendationScore
} from '@/types'

export class PreferenceManager {
  private static STORAGE_KEY = 'movie-swipe-preferences'
  private static INTERACTIONS_KEY = 'movie-swipe-interactions'
  private static MAX_INTERACTIONS = 100 // Limit stored interactions for memory

  /**
   * Get current user preferences from localStorage
   */
  static getPreferences(): UserPreferences {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const preferences = JSON.parse(stored)
        // Ensure date is properly parsed
        preferences.lastUpdated = new Date(preferences.lastUpdated)
        return preferences
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    }
    
    return DEFAULT_PREFERENCES
  }

  /**
   * Save user preferences to localStorage
   */
  static savePreferences(preferences: UserPreferences): void {
    if (typeof window === 'undefined') return
    
    try {
      preferences.lastUpdated = new Date()
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences))
    } catch (error) {
      console.error('Error saving preferences:', error)
    }
  }

  /**
   * Get stored movie interactions
   */
  static getInteractions(): MovieInteraction[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.INTERACTIONS_KEY)
      if (stored) {
        const interactions = JSON.parse(stored)
        // Parse dates
        return interactions.map((i: any) => ({
          ...i,
          timestamp: new Date(i.timestamp)
        }))
      }
    } catch (error) {
      console.error('Error loading interactions:', error)
    }
    
    return []
  }

  /**
   * Save a movie interaction and update preferences
   */
  static saveInteraction(movie: TMDBMovie, action: 'like' | 'dislike' | 'skip'): void {
    if (typeof window === 'undefined') return
    
    const interaction: MovieInteraction = {
      movieId: movie.id,
      action,
      timestamp: new Date(),
      genres: movie.genre_ids,
      rating: movie.vote_average
    }
    
    // Get existing interactions
    let interactions = this.getInteractions()
    interactions.unshift(interaction)
    
    // Limit stored interactions
    if (interactions.length > this.MAX_INTERACTIONS) {
      interactions = interactions.slice(0, this.MAX_INTERACTIONS)
    }
    
    // Save interactions
    try {
      localStorage.setItem(this.INTERACTIONS_KEY, JSON.stringify(interactions))
    } catch (error) {
      console.error('Error saving interaction:', error)
    }
    
    // Update preferences based on action
    this.updatePreferencesFromInteraction(movie, action)
  }

  /**
   * Update preferences based on movie interaction
   */
  private static updatePreferencesFromInteraction(movie: TMDBMovie, action: 'like' | 'dislike' | 'skip'): void {
    const preferences = this.getPreferences()
    
    if (action === 'like') {
      // Add genres to favorites (if not already disliked)
      movie.genre_ids.forEach(genreId => {
        if (!preferences.dislikedGenres.includes(genreId) && !preferences.favoriteGenres.includes(genreId)) {
          preferences.favoriteGenres.push(genreId)
        }
      })
      
      // Adjust minimum rating based on liked movies
      const interactions = this.getInteractions()
      const likedMovies = interactions.filter(i => i.action === 'like')
      if (likedMovies.length > 5) {
        const avgRating = likedMovies.reduce((sum, i) => sum + i.rating, 0) / likedMovies.length
        preferences.minimumRating = Math.max(5.0, avgRating - 1)
      }
    } else if (action === 'dislike') {
      // Add genres to disliked (remove from favorites if present)
      movie.genre_ids.forEach(genreId => {
        preferences.favoriteGenres = preferences.favoriteGenres.filter(id => id !== genreId)
        if (!preferences.dislikedGenres.includes(genreId)) {
          preferences.dislikedGenres.push(genreId)
        }
      })
    }
    
    this.savePreferences(preferences)
  }

  /**
   * Calculate recommendation score for a movie based on preferences
   * @param movie - Movie to score
   * @param preferences - User preferences
   * @param weights - Scoring weights
   * @returns Score between 0-1
   */
  static calculateRecommendationScore(
    movie: TMDBMovie,
    preferences: UserPreferences = this.getPreferences(),
    weights: PreferenceWeights = DEFAULT_WEIGHTS
  ): RecommendationScore {
    let score = 0
    const reasons: string[] = []
    
    // Genre scoring
    let genreScore = 0.5 // Neutral baseline
    const favoriteGenreMatches = movie.genre_ids.filter(id => preferences.favoriteGenres.includes(id))
    const dislikedGenreMatches = movie.genre_ids.filter(id => preferences.dislikedGenres.includes(id))
    
    if (favoriteGenreMatches.length > 0) {
      genreScore = Math.min(1, 0.5 + (favoriteGenreMatches.length * 0.2))
      reasons.push(`Matches ${favoriteGenreMatches.length} favorite genre(s)`)
    }
    if (dislikedGenreMatches.length > 0) {
      genreScore = Math.max(0, genreScore - (dislikedGenreMatches.length * 0.3))
      reasons.push(`Contains ${dislikedGenreMatches.length} disliked genre(s)`)
    }
    score += genreScore * weights.genre
    
    // Rating scoring
    const ratingScore = Math.min(1, movie.vote_average / 10)
    if (movie.vote_average >= preferences.minimumRating) {
      score += ratingScore * weights.rating
      reasons.push(`High rating: ${movie.vote_average.toFixed(1)}/10`)
    } else {
      score += (ratingScore * 0.5) * weights.rating
    }
    
    // Recency scoring
    const releaseYear = new Date(movie.release_date).getFullYear()
    const currentYear = new Date().getFullYear()
    const yearsSinceRelease = currentYear - releaseYear
    const recencyScore = Math.max(0, 1 - (yearsSinceRelease / 20))
    score += recencyScore * weights.recency
    
    // Popularity scoring
    const popularityScore = Math.min(1, movie.popularity / 100)
    score += popularityScore * weights.popularity
    
    // Language scoring
    const languageScore = preferences.languages.includes(movie.original_language) ? 1 : 0.3
    score += languageScore * weights.language
    if (preferences.languages.includes(movie.original_language)) {
      reasons.push(`Preferred language: ${movie.original_language}`)
    }
    
    return {
      movieId: movie.id,
      score: Math.min(1, Math.max(0, score)),
      reasons
    }
  }

  /**
   * Reset all preferences and interactions
   */
  static resetPreferences(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.INTERACTIONS_KEY)
  }

  /**
   * Get preference statistics
   */
  static getStatistics() {
    const interactions = this.getInteractions()
    const preferences = this.getPreferences()
    
    const stats = {
      totalInteractions: interactions.length,
      likes: interactions.filter(i => i.action === 'like').length,
      dislikes: interactions.filter(i => i.action === 'dislike').length,
      skips: interactions.filter(i => i.action === 'skip').length,
      favoriteGenres: preferences.favoriteGenres.length,
      dislikedGenres: preferences.dislikedGenres.length,
      lastUpdated: preferences.lastUpdated
    }
    
    return stats
  }
}