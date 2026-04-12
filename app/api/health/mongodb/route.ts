import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import connectDB from '@/lib/mongodb'

export async function GET() {
  const start = Date.now()

  try {
    await connectDB()

    const isConnected = mongoose.connection.readyState === 1

    if (!isConnected) {
      return NextResponse.json(
        {
          status: 'error',
          service: 'mongodb',
          message: 'Connexion MongoDB non établie',
          readyState: mongoose.connection.readyState,
          latency_ms: Date.now() - start,
        },
        { status: 503 }
      )
    }

    const db = mongoose.connection.db
    if (!db) {
      throw new Error('Instance de base de données non disponible')
    }
    await db.admin().ping()

    return NextResponse.json(
      {
        status: 'ok',
        service: 'mongodb',
        message: 'Connexion MongoDB opérationnelle',
        database: mongoose.connection.name,
        latency_ms: Date.now() - start,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        service: 'mongodb',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        latency_ms: Date.now() - start,
      },
      { status: 503 }
    )
  }
}
