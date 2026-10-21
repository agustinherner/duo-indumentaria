"use client";

import { useState } from "react";

export default function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("ok");
        setMessage(data.message || "¡Listo! Ya estás suscripto.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Ocurrió un error.");
      }
    } catch {
      setStatus("error");
      setMessage("No se pudo conectar. Intentá de nuevo.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu email"
          className={`flex-1 rounded-md px-3 py-2 text-sm outline-none ${
            dark ? "bg-white/10 text-white placeholder:text-neutral-500" : "border border-neutral-300"
          }`}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={`rounded-md px-4 py-2 text-sm font-semibold ${
            dark ? "bg-white text-ink" : "bg-ink text-white"
          } disabled:opacity-50`}
        >
          {status === "loading" ? "..." : "Sumarme"}
        </button>
      </div>
      {message && (
        <p className={`text-xs ${status === "ok" ? "text-green-400" : "text-red-400"}`}>{message}</p>
      )}
    </form>
  );
}
