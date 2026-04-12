import { NextRequest, NextResponse } from 'next/server'
import { getPopularMovies, searchMovies, TMDBResponse } from '@/lib/tmdb'
import redis from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')

    let data: TMDBResponse
    if (query) {
      data = await searchMovies(query)
    } else {
      const cacheKey = `tmdb:popular:page:${page}`

      const cached = await redis.get<TMDBResponse>(cacheKey)
      if (cached) {
        console.log(`[Cache HIT] ${cacheKey}`)
        return NextResponse.json({ success: true, data: cached }, { status: 200 })
      }

      console.log(`[Cache MISS] ${cacheKey} — appel TMDB`)
      data = await getPopularMovies(page)
      await redis.set(cacheKey, data, { ex: 3600 })
    }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/movies error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des films' },
      { status: 500 }
    )
  }
}
