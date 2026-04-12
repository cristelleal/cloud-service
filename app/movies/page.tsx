// app/movies/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPosterUrl, TMDBMovie } from '@/lib/tmdb'

interface Favorite {
  _id: string
  tmdbId: number
  title: string
  posterPath: string
  overview: string
  releaseDate: string
  voteAverage: number
}

// Carte film — version résultat de recherche
function MovieCard({
  movie,
  onAdd,
  isFavorite,
}: {
  movie: TMDBMovie
  onAdd: (movie: TMDBMovie) => void
  isFavorite: boolean
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
      {movie.poster_path ? (
        <img
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          className="w-full h-56 object-cover"
        />
      ) : (
        <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400">
          Pas d&apos;affiche
        </div>
      )}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{movie.title}</h3>
        <p className="text-xs text-gray-500 mb-2">{movie.release_date?.slice(0, 4)} · ⭐ {movie.vote_average.toFixed(1)}</p>
        <button
          onClick={() => onAdd(movie)}
          disabled={isFavorite}
          className={`mt-auto text-xs py-1.5 rounded-lg font-medium transition-colors ${
            isFavorite
              ? 'bg-gray-100 text-gray-400 cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isFavorite ? '✅ En favoris' : '+ Ajouter aux favoris'}
        </button>
      </div>
    </div>
  )
}

// Modale de détails d'un favori
function DetailModal({
  favorite,
  onClose,
}: {
  favorite: Favorite
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {favorite.posterPath && (
          <img
            src={getPosterUrl(favorite.posterPath)}
            alt={favorite.title}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-1">{favorite.title}</h2>
          <p className="text-sm text-gray-500 mb-3">
            {favorite.releaseDate?.slice(0, 4)} · ⭐ {favorite.voteAverage.toFixed(1)}
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            {favorite.overview || 'Aucune description disponible.'}
          </p>
          <div className="text-xs text-gray-400 mb-4">
            ID MongoDB : <span className="font-mono">{favorite._id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

// Carte film — version favori sauvegardé
function FavoriteCard({
  favorite,
  onDelete,
  onViewDetails,
}: {
  favorite: Favorite
  onDelete: (id: string) => void
  onViewDetails: (id: string) => void
}) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden flex gap-3 p-3">
      {favorite.posterPath ? (
        <img
          src={getPosterUrl(favorite.posterPath)}
          alt={favorite.title}
          className="w-16 h-24 object-cover rounded-lg flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-24 bg-gray-200 rounded-lg flex-shrink-0" />
      )}
      <div className="flex flex-col flex-1 min-w-0">
        <h3 className="font-semibold text-sm line-clamp-1">{favorite.title}</h3>
        <p className="text-xs text-gray-500">{favorite.releaseDate?.slice(0, 4)} · ⭐ {favorite.voteAverage.toFixed(1)}</p>
        <p className="text-xs text-gray-400 line-clamp-2 mt-1">{favorite.overview}</p>
        <div className="mt-auto flex gap-3">
          <button
            onClick={() => onViewDetails(favorite._id)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            🔍 Voir les détails
          </button>
          <button
            onClick={() => onDelete(favorite._id)}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            🗑 Supprimer
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MoviesPage() {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null)

  // Identifiants TMDB déjà en favoris (pour désactiver les boutons)
  const favoriteIds = new Set(favorites.map(f => f.tmdbId))

  // Chargement initial des favoris
  const loadFavorites = useCallback(async () => {
    const res = await fetch('/api/favorites')
    const data = await res.json()
    if (data.success) setFavorites(data.data)
  }, [])

  useEffect(() => {
    loadFavorites()
    // Charger les films populaires au démarrage
    fetch('/api/movies')
      .then(r => r.json())
      .then(data => { if (data.success) setMovies(data.data.results) })
  }, [loadFavorites])

  // Recherche de films
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const res = await fetch(`/api/movies?search=${encodeURIComponent(query)}`)
    const data = await res.json()
    if (data.success) setMovies(data.data.results)
    setLoading(false)
  }

  // Ajout aux favoris
  const handleAdd = async (movie: TMDBMovie) => {
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        overview: movie.overview,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
      }),
    })
    const data = await res.json()
    if (data.success) {
      setMessage(`"${movie.title}" ajouté aux favoris !`)
      loadFavorites()
    } else {
      setMessage(data.error)
    }
    setTimeout(() => setMessage(''), 3000)
  }

  // Affichage des détails d'un favori via GET /api/favorites/:id
  const handleViewDetails = async (id: string) => {
    const res = await fetch(`/api/favorites/${id}`)
    const data = await res.json()
    if (data.success) setSelectedFavorite(data.data)
  }

  // Suppression d'un favori
  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/favorites/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) loadFavorites()
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      {selectedFavorite && (
        <DetailModal
          favorite={selectedFavorite}
          onClose={() => setSelectedFavorite(null)}
        />
      )}
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🎬 Catalogue de films</h1>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un film..."
            className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '...' : '🔍 Rechercher'}
          </button>
        </form>

        {/* Message de feedback */}
        {message && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2 rounded-lg">
            {message}
          </div>
        )}

        <div className="flex gap-6">
          {/* Grille de films */}
          <div className="flex-1">
            <h2 className="font-semibold text-gray-700 mb-3">Résultats ({movies.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {movies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onAdd={handleAdd}
                  isFavorite={favoriteIds.has(movie.id)}
                />
              ))}
            </div>
          </div>

          {/* Sidebar favoris */}
          <div className="w-72 flex-shrink-0">
            <h2 className="font-semibold text-gray-700 mb-3">⭐ Mes favoris ({favorites.length})</h2>
            {favorites.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Aucun favori pour le moment</p>
            ) : (
              <div className="flex flex-col gap-3">
                {favorites.map(fav => (
                  <FavoriteCard key={fav._id} favorite={fav} onDelete={handleDelete} onViewDetails={handleViewDetails} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
