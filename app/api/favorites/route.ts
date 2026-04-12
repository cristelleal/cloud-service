// app/api/favorites/route.ts

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Favorite from '@/models/Favorite'

// GET /api/favorites — Liste tous les favoris
export async function GET() {
  try {
    await connectDB()

    const favorites = await Favorite.find({}).sort({ addedAt: -1 })

    return NextResponse.json(
      { success: true, data: favorites },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/favorites error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/favorites — Ajoute un film en favori
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { tmdbId, title, posterPath, overview, releaseDate, voteAverage } = body

    // Validation basique
    if (!tmdbId || !title) {
      return NextResponse.json(
        { success: false, error: 'tmdbId et title sont requis' },
        { status: 400 }
      )
    }

    // Vérification doublon
    const existing = await Favorite.findOne({ tmdbId })
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Ce film est déjà en favoris' },
        { status: 409 }
      )
    }

    const favorite = await Favorite.create({
      tmdbId,
      title,
      posterPath,
      overview,
      releaseDate,
      voteAverage,
    })

    return NextResponse.json(
      { success: true, data: favorite },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/favorites error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
