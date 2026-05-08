"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientHome() {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s+/g, "").replace(/^00/, "+");
    if (cleaned.length < 9) {
      setError("Numéro invalide");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/clients?phone=${encodeURIComponent(cleaned)}`);
      const data = await res.json();
      if (data.id) {
        router.push(`/client/${encodeURIComponent(cleaned)}`);
      } else {
        setError("Erreur, réessayez");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <header className="text-center pt-12 pb-6 px-4">
        <div className="text-5xl mb-3">☕</div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--gold)" }}
        >
          La Viennoise
        </h1>
        <p style={{ color: "var(--cream-muted)" }} className="text-sm mt-1 tracking-widest uppercase">
          à Bulle
        </p>
      </header>

      {/* Main card */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div
          className="w-full max-w-sm rounded-2xl p-6"
          style={{ background: "var(--bg-card)", border: "1px solid var(--gold-dark)" }}
        >
          <h2 className="text-xl font-semibold mb-1" style={{ color: "var(--cream)" }}>
            Bienvenue !
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--cream-muted)" }}>
            Entre ton numéro pour accéder à tes avantages et tenter ta chance sur la roue 🎰
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--cream-muted)" }}>
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+41 79 000 00 00"
                className="w-full rounded-xl px-4 py-3 text-base outline-none transition-all"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--cream)",
                  border: "1px solid var(--gold-dark)",
                }}
                required
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-center" style={{ color: "var(--danger)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-base transition-all active:scale-95 disabled:opacity-50"
              style={{
                background: loading ? "var(--gold-dark)" : "var(--gold)",
                color: "var(--bg)",
              }}
            >
              {loading ? "Chargement…" : "C'est parti ! →"}
            </button>
          </form>
        </div>

        {/* Événements */}
        <Link
          href="/evenements"
          className="mt-6 flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all active:scale-95"
          style={{ background: "var(--wine)", color: "var(--cream)" }}
        >
          🎤 Voir les événements
        </Link>
      </main>

      <footer className="text-center pb-8 text-xs" style={{ color: "var(--cream-muted)" }}>
        Karaoké &amp; Scène ouverte · Bulle
      </footer>
    </div>
  );
}
