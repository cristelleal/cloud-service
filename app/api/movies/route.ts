// app/api/movies/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getPopularMovies, searchMovies } from '@/lib/tmdb'

// GET /api/movies?search=batman — Films populaires ou résultats de recherche
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')

    let data
    if (query) {
      data = await searchMovies(query)
    } else {
      data = await getPopularMovies(page)
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
