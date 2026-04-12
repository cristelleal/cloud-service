// app/api/health/redis/route.ts

import { NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function GET() {
  const start = Date.now()

  try {
    // Ping léger : écriture + lecture d'une clé temporaire
    await redis.set('health:ping', 'pong', { ex: 10 })
    const pong = await redis.get('health:ping')

    if (pong !== 'pong') {
      return NextResponse.json(
        {
          status: 'error',
          service: 'redis',
          message: 'Redis a répondu mais la valeur est incorrecte',
          latency_ms: Date.now() - start,
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        service: 'redis',
        message: 'Connexion Redis opérationnelle',
        latency_ms: Date.now() - start,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        service: 'redis',
        message: error instanceof Error ? error.message : 'Erreur de connexion Redis',
        latency_ms: Date.now() - start,
      },
      { status: 503 }
    )
  }
}
