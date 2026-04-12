"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface HealthResult {
  status: "ok" | "error" | "loading";
  service: string;
  message: string;
  latency_ms?: number;
  database?: string;
}

const SERVICE_META: Record<string, { label: string; icon: string }> = {
  mongodb: { label: "MongoDB", icon: "🍃" },
  tmdb: { label: "TMDB API", icon: "🎬" },
  redis: { label: "Redis", icon: "⚡" },
};

function ServiceCard({ result }: { result: HealthResult }) {
  const isOk = result.status === "ok";
  const isLoading = result.status === "loading";
  const meta = SERVICE_META[result.service] ?? {
    label: result.service,
    icon: "🔧",
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg shadow-slate-200/60 p-6 transition-all duration-300 ${
        !isLoading
          ? "hover:shadow-xl hover:shadow-slate-200/70 hover:-translate-y-0.5"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
              isLoading ? "bg-slate-100" : isOk ? "bg-emerald-50" : "bg-rose-50"
            }`}
          >
            {meta.icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {meta.label}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{result.message}</p>
          </div>
        </div>

        <div className="flex-shrink-0">
          {isLoading ? (
            <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="w-3 h-3 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
              Vérif…
            </span>
          ) : isOk ? (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Opérationnel
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Erreur
            </span>
          )}
        </div>
      </div>

      {(result.latency_ms !== undefined || result.database) && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6">
          {result.latency_ms !== undefined && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Latence</p>
              <p
                className={`text-sm font-semibold ${
                  result.latency_ms < 100
                    ? "text-emerald-600"
                    : result.latency_ms < 500
                      ? "text-amber-500"
                      : "text-rose-500"
                }`}
              >
                {result.latency_ms} ms
              </p>
            </div>
          )}
          {result.database && (
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Base</p>
              <p className="text-sm font-semibold text-slate-700 font-mono">
                {result.database}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [results, setResults] = useState<HealthResult[]>([
    {
      status: "loading",
      service: "mongodb",
      message: "Vérification en cours...",
    },
    { status: "loading", service: "tmdb", message: "Vérification en cours..." },
    {
      status: "loading",
      service: "redis",
      message: "Vérification en cours...",
    },
  ]);
  const [lastCheck, setLastCheck] = useState<string>("");

  const runHealthChecks = useCallback(async () => {
    setResults([
      {
        status: "loading",
        service: "mongodb",
        message: "Vérification en cours...",
      },
      {
        status: "loading",
        service: "tmdb",
        message: "Vérification en cours...",
      },
      {
        status: "loading",
        service: "redis",
        message: "Vérification en cours...",
      },
    ]);

    const checks = await Promise.allSettled([
      fetch("/api/health/mongodb").then((r) => r.json()),
      fetch("/api/health/tmdb").then((r) => r.json()),
      fetch("/api/health/redis").then((r) => r.json()),
    ]);

    const services = ["mongodb", "tmdb", "redis"];
    setResults(
      checks.map((result, i) =>
        result.status === "fulfilled"
          ? result.value
          : {
              status: "error",
              service: services[i],
              message: "Endpoint injoignable",
            },
      ),
    );

    setLastCheck(new Date().toLocaleTimeString("fr-FR"));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runHealthChecks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [runHealthChecks]);

  const allOk = results.every((r) => r.status === "ok");
  const hasError = results.some((r) => r.status === "error");
  const isChecking = results.some((r) => r.status === "loading");

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 sm:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 transition-colors">
            <span className="text-sm leading-none">🎬</span>
            <span className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-slate-600 transition-colors leading-none">
              FilmsCatalogue
            </span>
          </Link>
          <Link
            href="/movies"
            className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Catalogue
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
        <div className="flex items-start justify-between mb-10">
          <div>
            <h1 className="text-2xl sm:text-4xl font-semibold text-slate-900 tracking-tight">
              Santé des services
            </h1>
            <p className="text-slate-400 mt-2 text-sm">
              {lastCheck ? (
                <>
                  Dernière vérification à{" "}
                  <span className="text-slate-600 font-medium">
                    {lastCheck}
                  </span>
                </>
              ) : (
                "Vérification en cours…"
              )}
            </p>
          </div>
          <button
            onClick={() => {
              void runHealthChecks();
            }}
            disabled={isChecking}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-sm font-medium hover:bg-slate-700 disabled:opacity-40 transition-all active:scale-95 shadow-lg shadow-slate-900/15 mt-1 cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Relancer
          </button>
        </div>

        {!isChecking && (
          <div
            className={`mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium ${
              allOk
                ? "bg-emerald-50 text-emerald-800"
                : hasError
                  ? "bg-rose-50 text-rose-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                allOk
                  ? "bg-emerald-500"
                  : hasError
                    ? "bg-rose-500"
                    : "bg-amber-400"
              }`}
            />
            {allOk
              ? "Tous les services sont opérationnels."
              : hasError
                ? "Un ou plusieurs services sont en erreur."
                : "Dégradation partielle détectée."}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {results.map((result) => (
            <ServiceCard key={result.service} result={result} />
          ))}
        </div>
      </div>
    </main>
  );
}
