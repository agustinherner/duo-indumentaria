"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      window.location.href = data.user?.role === "admin" ? "/admin" : "/cuenta";
    } else {
      setError(data.error || "No se pudo iniciar sesión.");
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-bold">Ingresar</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-dark w-full">
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿No tenés cuenta?{" "}
          <Link href="/cuenta/registro" className="font-semibold underline">
            Registrate
          </Link>
        </p>
      </div>
    </div>
  );
}
