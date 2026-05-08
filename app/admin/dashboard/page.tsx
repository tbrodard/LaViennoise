"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MENU = [
  { href: "/admin/dashboard/boissons", icon: "🍺", label: "Boissons & Gains", desc: "Créditer un client, valider les gains" },
  { href: "/admin/dashboard/roue", icon: "🎰", label: "Config. roue", desc: "Seuil de boissons, lots et probabilités" },
  { href: "/admin/dashboard/evenements", icon: "🎤", label: "Événements", desc: "Calendrier, inscriptions scène ouverte" },
  { href: "/admin/dashboard/stats", icon: "📊", label: "Statistiques", desc: "Clients, boissons, gains distribués" },
];

export default function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem("admin_auth")) {
      router.replace("/admin");
    }
  }, [router]);

  const logout = () => {
    sessionStorage.removeItem("admin_auth");
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <h1 className="text-xl font-bold" style={{ color: "var(--gold)" }}>
          ☕ Tableau de bord
        </h1>
        <button
          onClick={logout}
          className="text-xs px-3 py-1.5 rounded-full"
          style={{ background: "var(--bg-elevated)", color: "var(--cream-muted)" }}
        >
          Déconnexion
        </button>
      </header>

      <main className="flex-1 px-4 pb-16 max-w-sm mx-auto w-full flex flex-col gap-3 mt-2">
        {MENU.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 rounded-2xl p-5 transition-all active:scale-95"
            style={{ background: "var(--bg-card)", border: "1px solid var(--bg-elevated)" }}
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="font-semibold" style={{ color: "var(--cream)" }}>{item.label}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--cream-muted)" }}>{item.desc}</p>
            </div>
            <span className="ml-auto" style={{ color: "var(--gold-dark)" }}>›</span>
          </Link>
        ))}
      </main>
    </div>
  );
}
