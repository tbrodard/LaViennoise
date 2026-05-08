"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Stats {
  totalClients: number;
  totalBoissons: number;
  totalGains: number;
  gainsEnAttente: number;
  topClients: { phone: string; boissons_total: number }[];
  recentGains: {
    id: string;
    lot_label: string;
    statut: string;
    created_at: string;
    clients: { phone: string };
  }[];
}

const STATUT_STYLE: Record<string, { bg: string; label: string }> = {
  en_attente: { bg: "var(--wine)", label: "En attente" },
  valide: { bg: "var(--success)", label: "Validé" },
  refuse: { bg: "var(--bg-elevated)", label: "Refusé" },
};

export default function AdminStats() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("admin_auth")) {
      router.replace("/admin");
    }
    fetch("/api/stats").then((r) => r.json()).then(setStats);
  }, [router]);

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-2xl animate-pulse" style={{ color: "var(--gold)" }}>📊</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <Link href="/admin/dashboard" className="text-sm" style={{ color: "var(--cream-muted)" }}>← Retour</Link>
        <h1 className="text-lg font-bold" style={{ color: "var(--gold)" }}>📊 Statistiques</h1>
        <div className="w-12" />
      </header>

      <main className="flex-1 px-4 pb-16 max-w-sm mx-auto w-full flex flex-col gap-5">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Clients", value: stats.totalClients, icon: "👤" },
            { label: "Boissons", value: stats.totalBoissons, icon: "🍺" },
            { label: "Gains total", value: stats.totalGains, icon: "🏆" },
            { label: "En attente", value: stats.gainsEnAttente, icon: "⏳" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-2xl p-4 text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}
            >
              <div className="text-2xl">{kpi.icon}</div>
              <div className="text-2xl font-bold mt-1" style={{ color: "var(--gold)" }}>{kpi.value ?? 0}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--cream-muted)" }}>{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Top clients */}
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}>
          <p className="font-semibold mb-3" style={{ color: "var(--cream)" }}>🏅 Top 5 clients</p>
          {stats.topClients?.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--cream-muted)" }}>Aucun client encore</p>
          ) : (
            stats.topClients?.map((c, i) => (
              <div key={c.phone} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "var(--bg-elevated)" }}>
                <span className="text-lg font-bold w-6" style={{ color: i === 0 ? "var(--gold)" : "var(--cream-muted)" }}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm" style={{ color: "var(--cream)" }}>{c.phone}</span>
                <span className="text-sm font-semibold" style={{ color: "var(--gold)" }}>🍺 {c.boissons_total}</span>
              </div>
            ))
          )}
        </div>

        {/* Gains récents */}
        <div className="rounded-2xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}>
          <p className="font-semibold mb-3" style={{ color: "var(--cream)" }}>🕐 Gains récents</p>
          {stats.recentGains?.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--cream-muted)" }}>Aucun gain encore</p>
          ) : (
            stats.recentGains?.map((g) => {
              const style = STATUT_STYLE[g.statut] ?? STATUT_STYLE.refuse;
              return (
                <div key={g.id} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: "var(--bg-elevated)" }}>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: "var(--cream)" }}>{g.lot_label}</p>
                    <p className="text-xs" style={{ color: "var(--cream-muted)" }}>{g.clients?.phone}</p>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: style.bg, color: "white" }}
                  >
                    {style.label}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
