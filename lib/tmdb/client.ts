/**
 * TMDB API Client
 * Handles all interactions with The Movie Database API
 */

import axios, { AxiosInstance } from 'axios'
import { MovieResponse, MovieDetails, Genre, MovieFilters } from '@/types'

class TMDBClient {
  private client: AxiosInstance
  private imageBaseUrl: string

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY
    const baseURL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3'
    
    if (!apiKey) {
      throw new Error('TMDB API key is required. Please set NEXT_PUBLIC_TMDB_API_KEY in your environment variables.')
    }

    this.imageBaseUrl = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p'
    
    this.client = axios.create({
      baseURL,
      params: {
        api_key: apiKey
      },
      timeout: 10000
    })
  }

  /**
   * Get image URL for different sizes
   * @param path - Image path from TMDB
   * @param size - Image size (w300, w500, w780, original)
   */
  getImageUrl(path: string | null, size: 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) return null
    return `${this.imageBaseUrl}/${size}${path}`
  }

  /**
   * Discover movies with filters
   * @param filters - Filter options for movie discovery
   * @param page - Page number for pagination
   */
  async discoverMovies(filters: MovieFilters = {}, page: number = 1): Promise<MovieResponse> {
    try {
      const params: any = {
        page,
        sort_by: filters.sortBy || 'popularity.desc',
        include_adult: false,
        include_video: false
      }

      if (filters.genres && filters.genres.length > 0) {
        params.with_genres = filters.genres.join(',')
      }

      if (filters.yearRange) {
        params['primary_release_date.gte'] = `${filters.yearRange.min}-01-01`
        params['primary_release_date.lte'] = `${filters.yearRange.max}-12-31`
      }

      if (filters.ratingMin) {
        params['vote_average.gte'] = filters.ratingMin
      }

      if (filters.language) {
        params.with_original_language = filters.language
      }

      const response = await this.client.get<MovieResponse>('/discover/movie', { params })
      return response.data
    } catch (error) {
      console.error('Error discovering movies:', error)
      throw error
    }
  }

  /**
   * Get popular movies
   * @param page - Page number for pagination
   */
  async getPopularMovies(page: number = 1): Promise<MovieResponse> {
    try {
      const response = await this.client.get<MovieResponse>('/movie/popular', {
        params: { page }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching popular movies:', error)
      throw error
    }
  }

  /**
   * Get movie details by ID
   * @param movieId - TMDB movie ID
   * @param includeCredits - Whether to include cast and crew
   */
  async getMovieDetails(movieId: number, includeCredits: boolean = false): Promise<MovieDetails> {
    try {
      const params: any = {}
      if (includeCredits) {
        params.append_to_response = 'credits'
      }

      const response = await this.client.get<MovieDetails>(`/movie/${movieId}`, { params })
      return response.data
    } catch (error) {
      console.error(`Error fetching movie details for ID ${movieId}:`, error)
      throw error
    }
  }

  /**
   * Get all available genres
   */
  async getGenres(): Promise<Genre[]> {
    try {
      const response = await this.client.get<{ genres: Genre[] }>('/genre/movie/list')
      return response.data.genres
    } catch (error) {
      console.error('Error fetching genres:', error)
      throw error
    }
  }

  /**
   * Get movie recommendations based on a movie ID
   * @param movieId - TMDB movie ID
   * @param page - Page number for pagination
   */
  async getRecommendations(movieId: number, page: number = 1): Promise<MovieResponse> {
    try {
      const response = await this.client.get<MovieResponse>(`/movie/${movieId}/recommendations`, {
        params: { page }
      })
      return response.data
    } catch (error) {
      console.error(`Error fetching recommendations for movie ${movieId}:`, error)
      throw error
    }
  }

  /**
   * Search movies by query
   * @param query - Search query
   * @param page - Page number for pagination
   */
  async searchMovies(query: string, page: number = 1): Promise<MovieResponse> {
    try {
      const response = await this.client.get<MovieResponse>('/search/movie', {
        params: { query, page }
      })
      return response.data
    } catch (error) {
      console.error('Error searching movies:', error)
      throw error
    }
  }
}

// Export singleton instance
export const tmdbClient = new TMDBClient()