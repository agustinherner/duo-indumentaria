"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegistroPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [devLink, setDevLink] = useState("");
  const [loading, setLoading] = useState(false);

  function update(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setDone(true);
      if (data.devMailLink) setDevLink(data.devMailLink);
    } else {
      setError(data.error || "No se pudo crear la cuenta.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="container-page flex justify-center py-16">
        <div className="w-full max-w-md text-center">
          <p className="text-5xl">📧</p>
          <h1 className="mt-4 text-2xl font-bold">¡Revisá tu email!</h1>
          <p className="mt-3 text-neutral-600">
            Te enviamos un link para verificar tu cuenta. Hacé clic ahí para activarla y poder iniciar
            sesión.
          </p>
          {devLink && (
            <div className="mt-6 rounded-lg bg-neutral-900 p-4 text-left text-sm">
              <p className="mb-2 font-semibold">Modo desarrollo (SMTP no configurado):</p>
              <a href={devLink} className="break-all text-blue-400 underline">
                {devLink}
              </a>
            </div>
          )}
          <Link href="/cuenta/login" className="btn-dark mt-8">
            Ir a ingresar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-bold">Crear cuenta</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Nombre y apellido</label>
            <input className="input" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="label">Contraseña</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-dark w-full">
            {loading ? "Creando..." : "Crear cuenta"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Ya tenés cuenta?{" "}
          <Link href="/cuenta/login" className="font-semibold underline">
            Ingresá
          </Link>
        </p>
      </div>
    </div>
  );
}
