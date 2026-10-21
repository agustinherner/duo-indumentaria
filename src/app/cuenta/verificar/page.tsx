"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerificarInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Falta el token de verificación.");
      return;
    }
    fetch(`/api/auth/verify?token=${token}`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) {
          setStatus("ok");
          setMessage(d.message);
        } else {
          setStatus("error");
          setMessage(d.error || "No se pudo verificar.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexión.");
      });
  }, [token]);

  return (
    <div className="container-page py-24 text-center">
      {status === "loading" && <p className="text-neutral-500">Verificando...</p>}
      {status === "ok" && (
        <>
          <p className="text-6xl">🎉</p>
          <h1 className="mt-4 text-2xl font-bold">{message}</h1>
          <Link href="/cuenta/login" className="btn-dark mt-8">
            Iniciar sesión
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <p className="text-6xl">😕</p>
          <h1 className="mt-4 text-2xl font-bold">{message}</h1>
          <Link href="/cuenta/registro" className="btn-light mt-8">
            Volver a registrarme
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerificarPage() {
  return (
    <Suspense fallback={<div className="container-page py-24 text-center text-neutral-500">Cargando...</div>}>
      <VerificarInner />
    </Suspense>
  );
}
