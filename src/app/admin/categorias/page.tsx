"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  order: number;
  _count?: { products: number };
};

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const d = await fetch("/api/admin/categories").then((r) => r.json());
    setCategories(d.categories || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!editing) return;
    setError("");
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/admin/categories" : `/api/admin/categories/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      setError(data.error || "Error al guardar.");
    }
  }

  async function remove(c: Category) {
    if (!confirm(`¿Borrar la categoría "${c.name}"?`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) alert(data.error);
    load();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorías</h1>
          <p className="text-neutral-500">{categories.length} categorías</p>
        </div>
        <button onClick={() => { setError(""); setEditing({ name: "", emoji: "👕", order: categories.length + 1 }); }} className="btn-dark">
          + Nueva categoría
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{c.emoji}</span>
              <div>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-neutral-400">{c._count?.products ?? 0} productos</p>
              </div>
            </div>
            <div className="text-sm">
              <button onClick={() => { setError(""); setEditing(c); }} className="mr-2 underline">
                Editar
              </button>
              <button onClick={() => remove(c)} className="text-red-600 underline">
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">{editing.id ? "Editar categoría" : "Nueva categoría"}</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={editing.name || ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Emoji</label>
                  <input className="input" value={editing.emoji || ""} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} />
                </div>
                <div>
                  <label className="label">Orden</label>
                  <input className="input" type="number" value={editing.order ?? 0} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} />
                </div>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="btn-light">
                Cancelar
              </button>
              <button onClick={save} className="btn-dark">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
