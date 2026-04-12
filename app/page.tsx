import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-100 px-8 py-4">
        <span className="text-sm font-semibold text-slate-900 tracking-tight">
          FilmsCatalogue
        </span>
      </header>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-20">
        <div className="text-center max-w-lg">
          <div className="text-5xl mb-6">🎬</div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight mb-4">
            Bienvenue sur FilmsCatalogue
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mb-10">
            Explorez les films populaires, recherchez vos titres préférés et
            constituez votre liste de favoris.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/movies"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-sm font-medium hover:bg-slate-700 transition-all active:scale-95 shadow-lg shadow-slate-900/15"
            >
              Parcourir les films
            </Link>
            <Link
              href="/admin"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 px-8 py-3.5 rounded-2xl text-sm font-medium hover:bg-slate-100 transition-all active:scale-95 shadow-lg shadow-slate-200/60"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              État des services
            </Link>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
          {[
            {
              icon: "🔍",
              title: "Recherche",
              desc: "Films en temps réel via l'API TMDB",
            },
            {
              icon: "⭐",
              title: "Favoris",
              desc: "Sauvegardez vos films dans MongoDB",
            },
            {
              icon: "⚡",
              title: "Cache Redis",
              desc: "Résultats populaires mis en cache",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 p-6 text-center"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">
                {title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
