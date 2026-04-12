"use client";
import { useState, useEffect, useCallback, FormEvent } from "react";
import Link from "next/link";
import { getPosterUrl, TMDBMovie } from "@/lib/tmdb";

interface Favorite {
  _id: string;
  tmdbId: number;
  title: string;
  posterPath: string;
  overview: string;
  releaseDate: string;
  voteAverage: number;
}

function MovieCard({
  movie,
  onAdd,
  isFavorite,
}: {
  movie: TMDBMovie;
  onAdd: (movie: TMDBMovie) => void;
  isFavorite: boolean;
}) {
  return (
    <div className="group bg-white rounded-3xl shadow-lg shadow-slate-200/60 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/50">
      <div className="relative overflow-hidden">
        {movie.poster_path ? (
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-64 bg-slate-100 flex items-center justify-center text-slate-400 text-sm">
            Pas d&apos;affiche
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <span className="text-white/80 text-xs">
            {movie.release_date?.slice(0, 4)}
          </span>
          <span className="bg-white/15 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20">
            ★ {movie.vote_average.toFixed(1)}
          </span>
        </div>
        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-300" />
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 flex-1">
          {movie.title}
        </h3>
        <button
          onClick={() => onAdd(movie)}
          disabled={isFavorite}
          className={`text-xs py-2.5 rounded-xl font-medium transition-all duration-200 ${
            isFavorite
              ? "bg-slate-100 text-slate-400 cursor-default"
              : "bg-slate-900 text-white hover:bg-slate-700 active:scale-95"
          }`}
        >
          {isFavorite ? "✓ En favoris" : "+ Ajouter aux favoris"}
        </button>
      </div>
    </div>
  );
}

function DetailModal({
  favorite,
  onClose,
}: {
  favorite: Favorite;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl shadow-slate-400/20 max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {favorite.posterPath && (
          <div className="relative">
            <img
              src={getPosterUrl(favorite.posterPath)}
              alt={favorite.title}
              className="w-full h-72 object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
          </div>
        )}
        <div className="px-8 pb-8 -mt-2">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            {favorite.title}
          </h2>
          <div className="flex items-center gap-2 mb-5">
            <span className="text-xs text-slate-500">
              {favorite.releaseDate?.slice(0, 4)}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-xs font-semibold text-amber-500">
              ★ {favorite.voteAverage.toFixed(1)}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            {favorite.overview || "Aucune description disponible."}
          </p>
          <div className="text-xs text-slate-400 mb-6 bg-slate-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-slate-300 font-mono">ID</span>
            <span className="font-mono text-slate-500 truncate">
              {favorite._id}
            </span>
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
  );
}

function FavoriteCard({
  favorite,
  onDelete,
  onViewDetails,
}: {
  favorite: Favorite;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-md shadow-slate-200/60 overflow-hidden flex gap-4 p-4 transition-all duration-200 hover:shadow-lg hover:shadow-slate-200/70">
      {favorite.posterPath ? (
        <img
          src={getPosterUrl(favorite.posterPath)}
          alt={favorite.title}
          className="w-12 h-18 object-cover rounded-xl flex-shrink-0 aspect-[2/3]"
        />
      ) : (
        <div className="w-12 bg-slate-100 rounded-xl flex-shrink-0 aspect-[2/3]" />
      )}
      <div className="flex flex-col flex-1 min-w-0 gap-0.5 py-0.5">
        <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
          {favorite.title}
        </h3>
        <p className="text-xs text-slate-500">
          {favorite.releaseDate?.slice(0, 4)}
          <span className="mx-1.5 text-slate-300">·</span>
          <span className="text-amber-500 font-medium">
            ★ {favorite.voteAverage.toFixed(1)}
          </span>
        </p>
        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {favorite.overview}
        </p>
        <div className="mt-auto flex gap-3 pt-2">
          <button
            onClick={() => onViewDetails(favorite._id)}
            className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors underline underline-offset-2 decoration-slate-300 hover:decoration-slate-700"
          >
            Détails
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
  );
}

export default function MoviesPage() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(
    null,
  );

  const favoriteIds = new Set(favorites.map((f) => f.tmdbId));

  const loadFavorites = useCallback(async () => {
    const res = await fetch("/api/favorites");
    const data = await res.json();
    if (data.success) setFavorites(data.data);
  }, []);

  useEffect(() => {
    void loadFavorites();
    void fetch("/api/movies")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMovies(data.data.results);
      });
  }, [loadFavorites]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/movies?search=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data.success) setMovies(data.data.results);
    setLoading(false);
  };

  const handleAdd = async (movie: TMDBMovie) => {
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tmdbId: movie.id,
        title: movie.title,
        posterPath: movie.poster_path,
        overview: movie.overview,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setMessage(`"${movie.title}" ajouté aux favoris !`);
      loadFavorites();
    } else {
      setMessage(data.error);
    }
    setTimeout(() => setMessage(""), 3000);
  };

  const handleViewDetails = async (id: string) => {
    const res = await fetch(`/api/favorites/${id}`);
    const data = await res.json();
    if (data.success) setSelectedFavorite(data.data);
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/favorites/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) loadFavorites();
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {selectedFavorite && (
        <DetailModal
          favorite={selectedFavorite}
          onClose={() => setSelectedFavorite(null)}
        />
      )}

      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900 tracking-tight">
            FilmsCatalogue
          </span>
          <div className="flex items-center gap-4">
            {favorites.length > 0 && (
              <span className="text-xs text-slate-500">
                <span className="font-semibold text-slate-900">
                  {favorites.length}
                </span>{" "}
                favori{favorites.length > 1 ? "s" : ""}
              </span>
            )}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">
            Catalogue de films
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Explorez, recherchez et sauvegardez vos films préférés.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-10 max-w-2xl">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Titre, acteur, réalisateur..."
              className="w-full bg-white border-0 rounded-2xl pl-11 pr-5 py-3.5 text-sm text-slate-900 placeholder-slate-400 shadow-lg shadow-slate-200/50 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-slate-900 text-white px-7 py-3.5 rounded-2xl text-sm font-medium hover:bg-slate-700 disabled:opacity-40 transition-all active:scale-95 shadow-lg shadow-slate-900/15 whitespace-nowrap"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Recherche
              </span>
            ) : (
              "Rechercher"
            )}
          </button>
        </form>

        {message && (
          <div className="mb-8 max-w-2xl flex items-center gap-3 bg-white text-slate-700 text-sm px-5 py-3.5 rounded-2xl shadow-lg shadow-slate-200/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
            {message}
          </div>
        )}

        <div className="flex gap-10 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="font-semibold text-slate-900">Résultats</h2>
              <span className="text-slate-400 text-sm">
                {movies.length} films
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onAdd={handleAdd}
                  isFavorite={favoriteIds.has(movie.id)}
                />
              ))}
            </div>
          </div>

          <div className="w-80 flex-shrink-0">
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="font-semibold text-slate-900">Mes favoris</h2>
              {favorites.length > 0 && (
                <span className="text-xs font-semibold bg-slate-900 text-white px-2 py-0.5 rounded-full">
                  {favorites.length}
                </span>
              )}
            </div>
            {favorites.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md shadow-slate-200/50 px-6 py-12 text-center">
                <p className="text-2xl mb-2">🎬</p>
                <p className="text-sm font-medium text-slate-700">
                  Aucun favori
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Ajoutez des films depuis le catalogue
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {favorites.map((fav) => (
                  <FavoriteCard
                    key={fav._id}
                    favorite={fav}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
