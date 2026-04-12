import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL!;

export async function GET() {
  const start = Date.now();

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/configuration?api_key=${TMDB_API_KEY}`,
      { cache: "no-store" },
    );

    if (!res.ok) {
      return NextResponse.json(
        {
          status: "error",
          service: "tmdb",
          message: `TMDB a répondu avec le code ${res.status}`,
          latency_ms: Date.now() - start,
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        service: "tmdb",
        message: "API TMDB opérationnelle",
        latency_ms: Date.now() - start,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        service: "tmdb",
        message: error instanceof Error ? error.message : "Erreur réseau TMDB",
        latency_ms: Date.now() - start,
      },
      { status: 503 },
    );
  }
}
