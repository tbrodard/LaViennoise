"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "viennoise2024";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "1");
      router.push("/admin/dashboard");
    } else {
      setError("Mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="text-4xl mb-4">🔐</div>
      <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--gold)" }}>Espace gérant</h1>
      <p className="text-sm mb-8" style={{ color: "var(--cream-muted)" }}>La Viennoise à Bulle</p>

      <form
        onSubmit={handleLogin}
        className="w-full max-w-xs flex flex-col gap-4 rounded-2xl p-6"
        style={{ background: "var(--bg-card)", border: "1px solid var(--gold-dark)" }}
      >
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="w-full rounded-xl px-4 py-3 outline-none"
          style={{ background: "var(--bg-elevated)", color: "var(--cream)", border: "1px solid var(--gold-dark)" }}
          autoFocus
        />
        {error && <p className="text-sm text-center" style={{ color: "var(--danger)" }}>{error}</p>}
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-semibold"
          style={{ background: "var(--gold)", color: "var(--bg)" }}
        >
          Connexion
        </button>
      </form>
    </div>
  );
}
