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
    <div className="group bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/60">
      <div className="relative overflow-hidden">
        {movie.poster_path ? (
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-64 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
            Pas d&apos;affiche
          </div>
        )}
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors duration-300" />
      </div>
      <div className="p-5 flex flex-col flex-1 gap-2">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">{movie.title}</h3>
        <p className="text-xs text-slate-500">{movie.release_date?.slice(0, 4)} · ⭐ {movie.vote_average.toFixed(1)}</p>
        <button
          onClick={() => onAdd(movie)}
          disabled={isFavorite}
          className={`mt-auto text-xs py-2 rounded-xl font-medium transition-all duration-200 ${
            isFavorite
              ? 'bg-slate-100 text-slate-400 cursor-default'
              : 'bg-slate-900 text-white hover:bg-slate-700 active:scale-95'
          }`}
        >
          {isFavorite ? '✓ En favoris' : '+ Ajouter aux favoris'}
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
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl shadow-slate-300/50 max-w-md w-full overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {favorite.posterPath && (
          <img
            src={getPosterUrl(favorite.posterPath)}
            alt={favorite.title}
            className="w-full h-72 object-cover"
          />
        )}
        <div className="p-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">{favorite.title}</h2>
          <p className="text-sm text-slate-500 mb-4">
            {favorite.releaseDate?.slice(0, 4)} · ⭐ {favorite.voteAverage.toFixed(1)}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            {favorite.overview || 'Aucune description disponible.'}
          </p>
          <div className="text-xs text-slate-400 mb-6 bg-slate-50 rounded-xl px-4 py-2">
            ID : <span className="font-mono text-slate-500">{favorite._id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors active:scale-95"
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
    <div className="group bg-white rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden flex gap-4 p-4 transition-all duration-200 hover:shadow-xl hover:shadow-slate-200/60">
      {favorite.posterPath ? (
        <img
          src={getPosterUrl(favorite.posterPath)}
          alt={favorite.title}
          className="w-14 h-20 object-cover rounded-xl flex-shrink-0"
        />
      ) : (
        <div className="w-14 h-20 bg-slate-100 rounded-xl flex-shrink-0" />
      )}
      <div className="flex flex-col flex-1 min-w-0 gap-1">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">{favorite.title}</h3>
        <p className="text-xs text-slate-500">{favorite.releaseDate?.slice(0, 4)} · ⭐ {favorite.voteAverage.toFixed(1)}</p>
        <p className="text-xs text-slate-400 line-clamp-2">{favorite.overview}</p>
        <div className="mt-auto flex gap-4 pt-1">
          <button
            onClick={() => onViewDetails(favorite._id)}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            Voir les détails
          </button>
          <button
            onClick={() => onDelete(favorite._id)}
            className="text-xs text-rose-400 hover:text-rose-600 font-medium transition-colors"
          >
            Supprimer
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
    <main className="min-h-screen bg-slate-50 p-8">
      {selectedFavorite && (
        <DetailModal
          favorite={selectedFavorite}
          onClose={() => setSelectedFavorite(null)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Catalogue de films</h1>
          <p className="text-slate-500 mt-1 text-sm">Explorez, recherchez et sauvegardez vos films préférés.</p>
        </div>

        {/* Barre de recherche */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un film..."
            className="flex-1 bg-white border-0 rounded-2xl px-5 py-3.5 text-sm text-slate-900 placeholder-slate-400 shadow-lg shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-sm font-medium hover:bg-slate-700 disabled:opacity-40 transition-all active:scale-95 shadow-lg shadow-slate-900/20"
          >
            {loading ? '...' : 'Rechercher'}
          </button>
        </form>

        {/* Message de feedback */}
        {message && (
          <div className="mb-8 bg-white border-0 text-slate-700 text-sm px-5 py-3.5 rounded-2xl shadow-lg shadow-slate-200/50">
            {message}
          </div>
        )}

        <div className="flex gap-10 items-start">
          {/* Grille de films */}
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-slate-900 mb-5">
              Résultats
              <span className="ml-2 text-slate-400 font-normal text-sm">{movies.length} films</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          <div className="w-80 flex-shrink-0">
            <h2 className="font-semibold text-slate-900 mb-5">
              Mes favoris
              <span className="ml-2 text-slate-400 font-normal text-sm">{favorites.length}</span>
            </h2>
            {favorites.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 px-6 py-10 text-center">
                <p className="text-sm text-slate-400">Aucun favori pour le moment</p>
              </div>
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
