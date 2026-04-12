// app/api/favorites/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Favorite from '@/models/Favorite'

// GET /api/favorites/:id — Récupère un favori par son identifiant MongoDB
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const favorite = await Favorite.findById(id)

    if (!favorite) {
      return NextResponse.json(
        { success: false, error: 'Favori introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, data: favorite },
      { status: 200 }
    )
  } catch (error) {
    console.error('GET /api/favorites/:id error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites/:id — Supprime un favori
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()

    const { id } = await params
    const deleted = await Favorite.findByIdAndDelete(id)

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Favori introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Favori supprimé' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/favorites/:id error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
