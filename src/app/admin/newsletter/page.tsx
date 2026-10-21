"use client";

import { useEffect, useState } from "react";

type Sub = { id: string; email: string; createdAt: string };

export default function AdminNewsletter() {
  const [subs, setSubs] = useState<Sub[]>([]);

  useEffect(() => {
    fetch("/api/admin/newsletter")
      .then((r) => r.json())
      .then((d) => setSubs(d.subscribers || []));
  }, []);

  function exportCsv() {
    const csv = "email,fecha\n" + subs.map((s) => `${s.email},${new Date(s.createdAt).toISOString()}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-duo.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Newsletter</h1>
          <p className="text-neutral-500">{subs.length} suscriptores</p>
        </div>
        {subs.length > 0 && (
          <button onClick={exportCsv} className="btn-light">
            Exportar CSV
          </button>
        )}
      </div>

      {subs.length === 0 ? (
        <p className="rounded-xl border border-neutral-200 bg-white p-8 text-center text-neutral-500">
          Todavía no hay suscriptores.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-400">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Fecha de alta</th>
              </tr>
            </thead>
            <tbody>
              {subs.map((s) => (
                <tr key={s.id} className="border-b border-neutral-100">
                  <td className="p-3">{s.email}</td>
                  <td className="p-3 text-neutral-500">{new Date(s.createdAt).toLocaleDateString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
