"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

type Category = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  imageUrl: string;
  sizes: string;
  stock: number;
  featured: boolean;
  active: boolean;
  categoryId: string;
  category?: { name: string };
};

const empty: Partial<Product> = {
  name: "",
  description: "",
  price: 0,
  emoji: "👕",
  imageUrl: "",
  sizes: "S,M,L,XL",
  stock: 0,
  featured: false,
  active: true,
  categoryId: "",
};

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [p, c] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]);
    setProducts(p.products || []);
    setCategories(c.categories || []);
  }

  useEffect(() => {
    load();
  }, []);

  function newProduct() {
    setError("");
    setEditing({ ...empty, categoryId: categories[0]?.id || "" });
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) {
      setEditing((e) => ({ ...e!, imageUrl: data.url }));
    } else {
      setError(data.error || "Error al subir la imagen.");
    }
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setError("");
    const isNew = !editing.id;
    const res = await fetch(isNew ? "/api/admin/products" : `/api/admin/products/${editing.id}`, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setEditing(null);
      load();
    } else {
      setError(data.error || "Error al guardar.");
    }
  }

  async function remove(id: string) {
    if (!confirm("¿Seguro que querés borrar este producto?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  }

  function set<K extends keyof Product>(k: K, v: Product[K]) {
    setEditing((e) => ({ ...e!, [k]: v }));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-neutral-500">{products.length} productos cargados</p>
        </div>
        <button onClick={newProduct} className="btn-dark">
          + Nuevo producto
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-200 text-left text-xs uppercase text-neutral-400">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Precio</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 text-xl">
                      {p.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imageUrl} alt="" className="h-full w-full rounded object-cover" />
                      ) : (
                        p.emoji
                      )}
                    </div>
                    <span className="font-medium">{p.name}</span>
                    {p.featured && <span title="Destacado">⭐</span>}
                  </div>
                </td>
                <td className="p-3 text-neutral-500">{p.category?.name}</td>
                <td className="p-3">{formatPrice(p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  {p.active ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Activo</span>
                  ) : (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">Oculto</span>
                  )}
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => { setError(""); setEditing(p); }} className="mr-3 underline">
                    Editar
                  </button>
                  <button onClick={() => remove(p.id)} className="text-red-600 underline">
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-xl bg-white p-6">
            <h2 className="mb-4 text-lg font-bold">{editing.id ? "Editar producto" : "Nuevo producto"}</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={editing.name || ""} onChange={(e) => set("name", e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Precio (ARS)</label>
                  <input className="input" type="number" value={editing.price ?? 0} onChange={(e) => set("price", Number(e.target.value))} />
                </div>
                <div>
                  <label className="label">Stock</label>
                  <input className="input" type="number" value={editing.stock ?? 0} onChange={(e) => set("stock", Number(e.target.value))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Categoría</label>
                  <select className="input" value={editing.categoryId || ""} onChange={(e) => set("categoryId", e.target.value)}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Emoji (placeholder)</label>
                  <input className="input" value={editing.emoji || ""} onChange={(e) => set("emoji", e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label">Talles (separados por coma)</label>
                <input className="input" value={editing.sizes || ""} onChange={(e) => set("sizes", e.target.value)} />
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea className="input" rows={3} value={editing.description || ""} onChange={(e) => set("description", e.target.value)} />
              </div>

              <div>
                <label className="label">Imagen</label>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-neutral-100 text-3xl">
                    {editing.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editing.imageUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                    ) : (
                      editing.emoji
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
                      className="text-sm"
                    />
                    {uploading && <p className="text-xs text-neutral-500">Subiendo...</p>}
                    {editing.imageUrl && (
                      <button className="mt-1 block text-xs text-red-600 underline" onClick={() => set("imageUrl", "")}>
                        Quitar imagen (usar emoji)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!editing.featured} onChange={(e) => set("featured", e.target.checked)} />
                  Destacado
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={editing.active !== false} onChange={(e) => set("active", e.target.checked)} />
                  Visible en la tienda
                </label>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditing(null)} className="btn-light">
                Cancelar
              </button>
              <button onClick={save} disabled={saving} className="btn-dark">
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
