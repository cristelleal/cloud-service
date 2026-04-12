"use client";
import { useState, useEffect, useCallback } from "react";

// Types pour les résultats de health check
interface HealthResult {
  status: "ok" | "error" | "loading";
  service: string;
  message: string;
  latency_ms?: number;
  database?: string;
}

// Composant carte d'un service
function ServiceCard({ result }: { result: HealthResult }) {
  const isOk = result.status === "ok";
  const isLoading = result.status === "loading";

  return (
    <div
      className={`rounded-xl border p-5 shadow-sm transition-all ${
        isLoading
          ? "border-gray-200 bg-gray-50"
          : isOk
            ? "border-green-200 bg-green-50"
            : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800 uppercase text-sm tracking-wide">
          {result.service}
        </h3>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-full ${
            isLoading
              ? "bg-gray-200 text-gray-600"
              : isOk
                ? "bg-green-200 text-green-800"
                : "bg-red-200 text-red-800"
          }`}
        >
          {isLoading ? "..." : isOk ? "✅ OK" : "❌ ERREUR"}
        </span>
      </div>
      <p className="text-sm text-gray-600">{result.message}</p>
      {result.latency_ms !== undefined && (
        <p className="text-xs text-gray-400 mt-2">
          Latence : {result.latency_ms} ms
        </p>
      )}
      {result.database && (
        <p className="text-xs text-gray-400">Base : {result.database}</p>
      )}
    </div>
  );
}

export default function AdminPage() {
  const [results, setResults] = useState<HealthResult[]>([
    { status: "loading", service: "mongodb", message: "Vérification en cours..." },
    { status: "loading", service: "tmdb",    message: "Vérification en cours..." },
  ]);
  const [lastCheck, setLastCheck] = useState<string>("");

  const runHealthChecks = useCallback(async () => {
    setResults([
      { status: "loading", service: "mongodb", message: "Vérification en cours..." },
      { status: "loading", service: "tmdb",    message: "Vérification en cours..." },
    ]);

    // Lancement des deux checks en parallèle
    const checks = await Promise.allSettled([
      fetch("/api/health/mongodb").then((r) => r.json()),
      fetch("/api/health/tmdb").then((r) => r.json()),
    ]);

    const services = ["mongodb", "tmdb"];
    setResults(
      checks.map((result, i) =>
        result.status === "fulfilled"
          ? result.value
          : { status: "error", service: services[i], message: "Endpoint injoignable" },
      ),
    );

    setLastCheck(new Date().toLocaleTimeString("fr-FR"));
  }, []);

  // Lancement au montage du composant
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runHealthChecks();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [runHealthChecks]);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              🛠️ Admin — Santé des services
            </h1>
            {lastCheck && (
              <p className="text-sm text-gray-500 mt-1">
                Dernière vérification : {lastCheck}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              void runHealthChecks();
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            🔄 Relancer les checks
          </button>
        </div>

        <div className="grid gap-4">
          {results.map((result) => (
            <ServiceCard key={result.service} result={result} />
          ))}
        </div>
      </div>
    </main>
  );
}
