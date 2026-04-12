const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL!;
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

// Types TypeScript
export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

// Fonction utilitaire pour construire l'URL complète de l'image
export function getPosterUrl(posterPath: string): string {
  if (!posterPath) return "/placeholder-movie.png";
  return `${TMDB_IMAGE_BASE}${posterPath}`;
}

// Récupère les films populaires
export async function getPopularMovies(page = 1): Promise<TMDBResponse> {
  const url = `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`;

  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Erreur TMDB: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Recherche de films
export async function searchMovies(query: string): Promise<TMDBResponse> {
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    // Pas de cache pour les recherches (résultats variables)
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Erreur TMDB: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Récupère les détails d'un film
export async function getMovieById(id: number): Promise<TMDBMovie> {
  const url = `${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=fr-FR`;

  const res = await fetch(url, {
    next: { revalidate: 86400 }, // Cache 24h pour les détails
  });

  if (!res.ok) {
    throw new Error(`Film introuvable: ${res.status}`);
  }

  return res.json();
}
