"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, useAnimation } from "framer-motion";
import type { Client, RoueConfig, RouteLot } from "@/lib/types";

export default function RouePage() {
  const params = useParams();
  const router = useRouter();
  const phone = decodeURIComponent(params.phone as string);

  const [client, setClient] = useState<Client | null>(null);
  const [config, setConfig] = useState<RoueConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ lot: RouteLot; message: string } | null>(null);
  const [rotation, setRotation] = useState(0);
  const controls = useAnimation();
  const currentRotation = useRef(0);

  useEffect(() => {
    const load = async () => {
      const [cr, cc] = await Promise.all([
        fetch(`/api/clients?phone=${encodeURIComponent(phone)}`),
        fetch("/api/roue-config"),
      ]);
      const [c, conf] = await Promise.all([cr.json(), cc.json()]);
      if (!c.id || c.tours_disponibles <= 0) { router.push(`/client/${encodeURIComponent(phone)}`); return; }
      setClient(c);
      setConfig(conf);
      setLoading(false);
    };
    load();
  }, [phone, router]);

  const spin = async () => {
    if (spinning || !client || !config) return;
    setSpinning(true);
    setResult(null);

    const res = await fetch("/api/gains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ client_id: client.id }),
    });
    const data = await res.json();

    if (data.error) {
      setSpinning(false);
      return;
    }

    const lots = config.lots;
    const winningIndex = lots.findIndex((l: RouteLot) => l.id === data.lot.id);
    const sliceAngle = 360 / lots.length;
    const targetAngle = -(winningIndex * sliceAngle + sliceAngle / 2);
    const spins = 5 * 360;
    const finalRotation = currentRotation.current + spins + targetAngle - (currentRotation.current % 360);

    currentRotation.current = finalRotation;
    setRotation(finalRotation);

    await controls.start({
      rotate: finalRotation,
      transition: { duration: 4, ease: [0.17, 0.67, 0.12, 1.0] },
    });

    setResult({
      lot: data.lot,
      message: data.lot.valeur
        ? `🎉 ${data.lot.label} !`
        : "Pas de chance cette fois…",
    });
    setClient((prev) => prev ? { ...prev, tours_disponibles: prev.tours_disponibles - 1 } : prev);
    setSpinning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-2xl animate-pulse" style={{ color: "var(--gold)" }}>☕</div>
      </div>
    );
  }

  const lots = config!.lots;
  const sliceAngle = 360 / lots.length;
  const radius = 140;
  const cx = 150;
  const cy = 150;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <header className="flex items-center justify-between px-4 pt-8 pb-4">
        <button
          onClick={() => router.push(`/client/${encodeURIComponent(phone)}`)}
          className="text-sm"
          style={{ color: "var(--cream-muted)" }}
        >
          ← Retour
        </button>
        <h1 className="text-lg font-bold" style={{ color: "var(--gold)" }}>
          La Roue
        </h1>
        <div
          className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{ background: "var(--wine)", color: "var(--cream)" }}
        >
          {client!.tours_disponibles} tour{client!.tours_disponibles !== 1 ? "s" : ""}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-10 gap-6">
        {/* Indicateur */}
        <div className="relative">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 w-0 h-0 z-10"
            style={{
              borderLeft: "12px solid transparent",
              borderRight: "12px solid transparent",
              borderTop: "22px solid var(--gold)",
            }}
          />

          {/* Roue SVG */}
          <motion.svg
            width={300}
            height={300}
            viewBox="0 0 300 300"
            animate={controls}
            style={{ originX: "50%", originY: "50%", rotate: rotation }}
          >
            {lots.map((lot: RouteLot, i: number) => {
              const startAngle = (i * sliceAngle - 90) * (Math.PI / 180);
              const endAngle = ((i + 1) * sliceAngle - 90) * (Math.PI / 180);
              const x1 = cx + radius * Math.cos(startAngle);
              const y1 = cy + radius * Math.sin(startAngle);
              const x2 = cx + radius * Math.cos(endAngle);
              const y2 = cy + radius * Math.sin(endAngle);
              const midAngle = ((i + 0.5) * sliceAngle - 90) * (Math.PI / 180);
              const tx = cx + (radius * 0.65) * Math.cos(midAngle);
              const ty = cy + (radius * 0.65) * Math.sin(midAngle);
              const labelAngle = (i + 0.5) * sliceAngle - 90;

              return (
                <g key={lot.id}>
                  <path
                    d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                    fill={lot.couleur}
                    stroke="var(--bg)"
                    strokeWidth={2}
                  />
                  <text
                    x={tx}
                    y={ty}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={lots.length > 6 ? 9 : 11}
                    fontWeight="bold"
                    fill="white"
                    transform={`rotate(${labelAngle}, ${tx}, ${ty})`}
                  >
                    {lot.label.length > 12 ? lot.label.slice(0, 12) + "…" : lot.label}
                  </text>
                </g>
              );
            })}
            {/* Centre */}
            <circle cx={cx} cy={cy} r={22} fill="var(--bg)" stroke="var(--gold)" strokeWidth={3} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize={18}>
              ☕
            </text>
          </motion.svg>
        </div>

        {/* Résultat */}
        {result ? (
          <div
            className="w-full max-w-xs rounded-2xl p-5 text-center"
            style={{
              background: result.lot.valeur ? "var(--bg-card)" : "var(--bg-elevated)",
              border: `2px solid ${result.lot.valeur ? "var(--gold)" : "var(--bg-elevated)"}`,
            }}
          >
            <p className="text-2xl font-bold mb-1" style={{ color: result.lot.valeur ? "var(--gold)" : "var(--cream-muted)" }}>
              {result.message}
            </p>
            {result.lot.valeur && (
              <p className="text-sm mt-2" style={{ color: "var(--cream-muted)" }}>
                Montre cet écran au barman pour valider ton gain 🙌
              </p>
            )}

            {client!.tours_disponibles > 0 ? (
              <button
                onClick={spin}
                className="mt-4 w-full py-3 rounded-xl font-semibold transition-all active:scale-95"
                style={{ background: "var(--gold)", color: "var(--bg)" }}
              >
                Rejouer ({client!.tours_disponibles} tour{client!.tours_disponibles !== 1 ? "s" : ""})
              </button>
            ) : (
              <button
                onClick={() => router.push(`/client/${encodeURIComponent(phone)}`)}
                className="mt-4 w-full py-3 rounded-xl font-semibold transition-all active:scale-95"
                style={{ background: "var(--wine)", color: "var(--cream)" }}
              >
                Retour à mon compte
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={spin}
            disabled={spinning}
            className="px-10 py-4 rounded-2xl font-bold text-xl transition-all active:scale-95 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, var(--gold-dark), var(--gold))",
              color: "var(--bg)",
            }}
          >
            {spinning ? "⏳ En cours…" : "🎰 Tourner !"}
          </button>
        )}
      </main>
    </div>
  );
}
