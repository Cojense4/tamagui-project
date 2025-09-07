import { NextRequest, NextResponse } from 'next/server'
import { tmdbClient } from '@/lib/tmdb/client'
import { MovieFilters } from '@/types'

/**
 * GET /api/movies
 * Fetch movies based on filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const genres = searchParams.get('genres')?.split(',').map(Number).filter(Boolean)
    const yearMin = searchParams.get('yearMin')
    const yearMax = searchParams.get('yearMax')
    const ratingMin = searchParams.get('ratingMin')
    const language = searchParams.get('language')
    const sortBy = searchParams.get('sortBy') as MovieFilters['sortBy']

    const filters: MovieFilters = {}
    
    if (genres && genres.length > 0) {
      filters.genres = genres
    }
    
    if (yearMin || yearMax) {
      filters.yearRange = {
        min: yearMin ? parseInt(yearMin) : 1900,
        max: yearMax ? parseInt(yearMax) : new Date().getFullYear()
      }
    }
    
    if (ratingMin) {
      filters.ratingMin = parseFloat(ratingMin)
    }
    
    if (language) {
      filters.language = language
    }
    
    if (sortBy) {
      filters.sortBy = sortBy
    }

    const movies = await tmdbClient.discoverMovies(filters, page)
    
    return NextResponse.json(movies)
  } catch (error) {
    console.error('Error in /api/movies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch movies' },
      { status: 500 }
    )
  }
}