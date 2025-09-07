import { NextRequest, NextResponse } from 'next/server'
import { tmdbClient } from '@/lib/tmdb/client'

/**
 * GET /api/movies/[id]
 * Get movie details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const movieId = parseInt(params.id)
    
    if (isNaN(movieId)) {
      return NextResponse.json(
        { error: 'Invalid movie ID' },
        { status: 400 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const includeCredits = searchParams.get('credits') === 'true'
    
    const movie = await tmdbClient.getMovieDetails(movieId, includeCredits)
    
    return NextResponse.json(movie)
  } catch (error) {
    console.error(`Error in /api/movies/${params.id}:`, error)
    return NextResponse.json(
      { error: 'Failed to fetch movie details' },
      { status: 500 }
    )
  }
}