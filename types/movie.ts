/**
 * Movie-related type definitions
 */

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  original_language: string
  popularity: number
  adult: boolean
}

export interface MovieDetails extends TMDBMovie {
  genres: Genre[]
  runtime: number
  tagline: string
  production_companies: ProductionCompany[]
  credits?: {
    cast: CastMember[]
    crew: CrewMember[]
  }
}

export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface MovieResponse {
  page: number
  results: TMDBMovie[]
  total_pages: number
  total_results: number
}

export interface MovieFilters {
  genres?: number[]
  yearRange?: {
    min: number
    max: number
  }
  ratingMin?: number
  language?: string
  sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc'
}