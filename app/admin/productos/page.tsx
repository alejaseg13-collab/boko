"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { supabase } from "@/lib/supabase";

type DBProduct = {
  id: string;
  nombre: string;
  slug: string;
  sku: string | null;
  descripcion: string | null;
  precio: number;
  precio_anterior: number | null;
  stock: number;
  tiempo_entrega_dias: number;
  imagenes: string[];
  tallas: string[];
  etiquetas: string[];
  categories: { nombre: string } | null;
};

type ProductForm = {
  nombre: string; slug: string; sku: string; descripcion: string;
  precio: number; precio_anterior: string; stock: number; tiempo_entrega_dias: number;
};

type ImageSlot = { file: File; preview: string } | null;

const initForm: ProductForm = { nombre: "", slug: "", sku: "", descripcion: "", precio: 0, precio_anterior: "", stock: 0, tiempo_entrega_dias: 5 };
const MAX_IMAGES = 4;
const labels = ["Principal", "Ángulo 2", "Ángulo 3", "Ángulo 4"];

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const CATEGORIAS = ["Videojuegos", "Accesorios", "Naturaleza", "Humanos", "Animales", "Anime", "Otros"];

/* ── Tag input ── */
function TagInput({ label, placeholder, tags, onChange }: {
  label: string; placeholder: string; tags: string[]; onChange: (t: string[]) => void;
}) {
  const [input, setInput] = useState("");
  function add() { const v = input.trim(); if (v && !tags.includes(v)) onChange([...tags, v]); setInput(""); }
  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
    if (e.key === "Backspace" && !input && tags.length) onChange(tags.slice(0, -1));
  }
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-500">{label}</label>
      <div className="min-h-[42px] px-3 py-2 rounded-xl border border-boko-border flex flex-wrap gap-1.5 focus-within:border-[#796a73]">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#796a73]/10 text-[#796a73] text-xs font-medium">
            {t}
            <button type="button" onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-red-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </span>
        ))}
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey} onBlur={add}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-24 text-sm outline-none bg-transparent placeholder:text-gray-400" />
      </div>
      <p className="text-xs text-gray-400">Enter o coma para agregar</p>
    </div>
  );
}

/* ── Category checkboxes ── */
function CategoryCheckboxes({ selected, onChange }: { selected: string[]; onChange: (t: string[]) => void }) {
  function toggle(cat: string) {
    onChange(selected.includes(cat) ? selected.filter(c => c !== cat) : [...selected, cat]);
  }
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-gray-500">Etiquetas</label>
      <div className="flex flex-wrap gap-2">
        {CATEGORIAS.map(cat => {
          const checked = selected.includes(cat);
          return (
            <button key={cat} type="button" onClick={() => toggle(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-colors ${checked ? "bg-[#796a73] text-white border-[#796a73]" : "bg-white text-gray-500 border-boko-border hover:border-[#796a73]"}`}>
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Image upload slot (for new images) ── */
function ImageUploadSlot({ slot, index, onAdd, onRemove }: {
  slot: ImageSlot; index: number; onAdd: (i: number, f: File) => void; onRemove: (i: number) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400">{labels[index]}</span>
      <div
        className={`relative aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-colors ${slot ? "border-transparent" : "border-boko-border hover:border-[#796a73]"}`}
        onClick={() => !slot && ref.current?.click()}
      >
        {slot ? (
          <>
            <img src={slot.preview} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={e => { e.stopPropagation(); onRemove(index); }}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <span className="text-xs">Subir</span>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onAdd(index, f); e.target.value = ""; }} />
      </div>
    </div>
  );
}

/* ── Shared form fields ── */
function ProductFields({ form, setForm, tallas, setTallas, etiquetas, setEtiquetas }: {
  form: ProductForm; setForm: (f: ProductForm) => void;
  tallas: string[]; setTallas: (t: string[]) => void;
  etiquetas: string[]; setEtiquetas: (t: string[]) => void;
}) {
  const cls = "px-4 py-2.5 rounded-xl border border-boko-border text-sm focus:outline-none focus:border-[#796a73]";
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500">Nombre *</label>
          <input type="text" value={form.nombre} className={cls}
            onChange={e => setForm({ ...form, nombre: e.target.value, slug: slugify(e.target.value) })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500">SKU</label>
          <input type="text" placeholder="Ej: BK-001" value={form.sku} className={cls}
            onChange={e => setForm({ ...form, sku: e.target.value })} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-gray-500">Descripción</label>
        <textarea value={form.descripcion} rows={3} className={`${cls} resize-none`}
          onChange={e => setForm({ ...form, descripcion: e.target.value })} />
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500">Precio (COP) *</label>
          <input type="number" value={form.precio} className={cls}
            onChange={e => setForm({ ...form, precio: +e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500">Precio antes del descuento</label>
          <input type="number" placeholder="Vacío = sin descuento" value={form.precio_anterior} className={cls}
            onChange={e => setForm({ ...form, precio_anterior: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500">Stock</label>
          <input type="number" value={form.stock} className={cls}
            onChange={e => setForm({ ...form, stock: +e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-500">Entrega (días)</label>
          <input type="number" value={form.tiempo_entrega_dias} className={cls}
            onChange={e => setForm({ ...form, tiempo_entrega_dias: +e.target.value })} />
        </div>
      </div>
      <TagInput label="Tamaños" placeholder="Ej: 18.4cm x 8.6cm" tags={tallas} onChange={setTallas} />
      <CategoryCheckboxes selected={etiquetas} onChange={setEtiquetas} />
    </>
  );
}

/* ══ Page ══ */
export default function AdminProductosPage() {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<ProductForm>(initForm);
  const [createSlots, setCreateSlots] = useState<ImageSlot[]>(Array(MAX_IMAGES).fill(null));
  const [createTallas, setCreateTallas] = useState<string[]>([]);
  const [createEtiquetas, setCreateEtiquetas] = useState<string[]>([]);
  const [createError, setCreateError] = useState("");
  const [createSaving, setCreateSaving] = useState(false);

  // Edit form
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductForm>(initForm);
  const [editSlots, setEditSlots] = useState<ImageSlot[]>(Array(MAX_IMAGES).fill(null));
  const [editTallas, setEditTallas] = useState<string[]>([]);
  const [editEtiquetas, setEditEtiquetas] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editError, setEditError] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from("products")
      .select("id, nombre, slug, sku, descripcion, precio, precio_anterior, stock, tiempo_entrega_dias, imagenes, tallas, etiquetas, categories(nombre)")
      .order("created_at", { ascending: false });
    setProducts((data as DBProduct[]) ?? []);
    setLoading(false);
  }

  /* ── Image slot helpers ── */
  function addSlot(slots: ImageSlot[], setSlots: (s: ImageSlot[]) => void, i: number, file: File) {
    const preview = URL.createObjectURL(file);
    setSlots(slots.map((s, idx) => idx === i ? { file, preview } : s));
  }
  function removeSlot(slots: ImageSlot[], setSlots: (s: ImageSlot[]) => void, i: number) {
    setSlots(slots.map((s, idx) => { if (idx !== i) return s; if (s) URL.revokeObjectURL(s.preview); return null; }));
  }
  function resetSlots(slots: ImageSlot[], setSlots: (s: ImageSlot[]) => void) {
    slots.forEach(s => { if (s) URL.revokeObjectURL(s.preview); });
    setSlots(Array(MAX_IMAGES).fill(null));
  }

  async function uploadSlots(productId: string, slots: ImageSlot[]): Promise<{ urls: string[]; errors: string[] }> {
    const urls: string[] = [];
    const errors: string[] = [];
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (!slot) continue;
      const ext = slot.file.name.split(".").pop() ?? "jpg";
      const path = `${productId}/${i}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("products").upload(path, slot.file, { upsert: true });
      if (error) { errors.push(`Imagen ${i + 1}: ${error.message}`); continue; }
      const { data } = supabase.storage.from("products").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return { urls, errors };
  }

  /* ── Create ── */
  function resetCreate() {
    setCreateForm(initForm); resetSlots(createSlots, setCreateSlots);
    setCreateTallas([]); setCreateEtiquetas([]); setCreateError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError("");
    if (!createForm.nombre) { setCreateError("El nombre es obligatorio"); return; }
    setCreateSaving(true);
    const { data: inserted, error } = await supabase.from("products").insert({
      nombre: createForm.nombre, slug: createForm.slug, sku: createForm.sku || null,
      descripcion: createForm.descripcion || null, precio: createForm.precio,
      precio_anterior: createForm.precio_anterior !== "" ? +createForm.precio_anterior : null,
      stock: createForm.stock, tiempo_entrega_dias: createForm.tiempo_entrega_dias,
      tallas: createTallas, etiquetas: createEtiquetas, imagenes: [],
    }).select("id").single();
    if (error || !inserted) { setCreateError(error?.message ?? "Error"); setCreateSaving(false); return; }
    const { urls, errors } = await uploadSlots(inserted.id, createSlots);
    if (errors.length) { setCreateError("Producto creado pero error al subir imágenes: " + errors.join(", ")); setCreateSaving(false); load(); return; }
    if (urls.length) await supabase.from("products").update({ imagenes: urls }).eq("id", inserted.id);
    resetCreate(); setShowCreate(false); setCreateSaving(false); load();
  }

  /* ── Edit ── */
  function openEdit(p: DBProduct) {
    setEditingId(p.id);
    setEditForm({
      nombre: p.nombre, slug: p.slug, sku: p.sku ?? "", descripcion: p.descripcion ?? "",
      precio: p.precio, precio_anterior: p.precio_anterior?.toString() ?? "",
      stock: p.stock, tiempo_entrega_dias: p.tiempo_entrega_dias,
    });
    setExistingImages(p.imagenes ?? []);
    setEditTallas(p.tallas ?? []);
    setEditEtiquetas(p.etiquetas ?? []);
    resetSlots(editSlots, setEditSlots);
    setEditError("");
  }

  function closeEdit() {
    setEditingId(null);
    resetSlots(editSlots, setEditSlots);
  }

  function removeExistingImage(url: string) {
    setExistingImages(prev => prev.filter(u => u !== url));
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setEditError("");
    if (!editForm.nombre) { setEditError("El nombre es obligatorio"); return; }
    setEditSaving(true);
    const { urls: newUrls, errors: uploadErrors } = await uploadSlots(editingId, editSlots);
    if (uploadErrors.length) { setEditError("Error al subir imágenes: " + uploadErrors.join(", ")); setEditSaving(false); return; }
    const allImages = [...existingImages, ...newUrls];
    const { error } = await supabase.from("products").update({
      nombre: editForm.nombre, slug: editForm.slug, sku: editForm.sku || null,
      descripcion: editForm.descripcion || null, precio: editForm.precio,
      precio_anterior: editForm.precio_anterior !== "" ? +editForm.precio_anterior : null,
      stock: editForm.stock, tiempo_entrega_dias: editForm.tiempo_entrega_dias,
      tallas: editTallas, etiquetas: editEtiquetas, imagenes: allImages,
    }).eq("id", editingId);
    if (error) { setEditError(error.message); setEditSaving(false); return; }
    closeEdit(); setEditSaving(false); load();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
    if (editingId === id) closeEdit();
  }

  const filtered = products.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-serif text-2xl font-bold text-[#796a73]">Gestión de productos</h1>
        <button
          onClick={() => { setShowCreate(!showCreate); if (showCreate) resetCreate(); closeEdit(); }}
          className="px-5 py-2.5 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          {showCreate ? "Cancelar" : "Agregar producto"}
        </button>
      </div>

      {/* ── Formulario CREAR ── */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-boko-border p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-boko-dark text-sm">Nuevo producto</h2>
          {createError && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{createError}</p>}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Imágenes</label>
            <div className="grid grid-cols-4 gap-3">
              {createSlots.map((slot, i) => (
                <ImageUploadSlot key={i} slot={slot} index={i}
                  onAdd={(idx, f) => addSlot(createSlots, setCreateSlots, idx, f)}
                  onRemove={idx => removeSlot(createSlots, setCreateSlots, idx)} />
              ))}
            </div>
          </div>
          <ProductFields form={createForm} setForm={setCreateForm} tallas={createTallas} setTallas={setCreateTallas} etiquetas={createEtiquetas} setEtiquetas={setCreateEtiquetas} />
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={createSaving} className="px-6 py-2.5 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 disabled:opacity-60">
              {createSaving ? "Guardando..." : "Crear producto"}
            </button>
            <button type="button" onClick={() => { setShowCreate(false); resetCreate(); }} className="px-6 py-2.5 rounded-xl bg-gray-100 text-boko-dark text-sm font-medium hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* ── Formulario EDITAR ── */}
      {editingId && (
        <form onSubmit={handleUpdate} className="bg-white rounded-2xl border-2 border-[#796a73]/30 p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-boko-dark text-sm">Editar producto</h2>
            <button type="button" onClick={closeEdit} className="text-gray-400 hover:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          {editError && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{editError}</p>}

          {/* Imágenes actuales */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Imágenes actuales</label>
            {existingImages.length === 0 ? (
              <p className="text-xs text-gray-400">Sin imágenes. Agrega nuevas abajo.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-boko-border">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6 6 18M6 6l12 12"/></svg>
                    </button>
                    {i === 0 && <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-black/40 text-white">Principal</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Agregar nuevas imágenes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-gray-500">Agregar imágenes</label>
            <div className="grid grid-cols-4 gap-3">
              {editSlots.map((slot, i) => (
                <ImageUploadSlot key={i} slot={slot} index={i}
                  onAdd={(idx, f) => addSlot(editSlots, setEditSlots, idx, f)}
                  onRemove={idx => removeSlot(editSlots, setEditSlots, idx)} />
              ))}
            </div>
            <p className="text-xs text-gray-400">Las nuevas imágenes se agregarán a las existentes.</p>
          </div>

          <ProductFields form={editForm} setForm={setEditForm} tallas={editTallas} setTallas={setEditTallas} etiquetas={editEtiquetas} setEtiquetas={setEditEtiquetas} />

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={editSaving} className="px-6 py-2.5 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 disabled:opacity-60">
              {editSaving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button type="button" onClick={closeEdit} className="px-6 py-2.5 rounded-xl bg-gray-100 text-boko-dark text-sm font-medium hover:bg-gray-200">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Buscador */}
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-boko-border text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#796a73] bg-white" />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-boko-muted animate-pulse">Cargando productos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-boko-muted">
            {search ? "No se encontraron productos." : "Aún no hay productos. ¡Agrega el primero!"}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-boko-border">
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Producto</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">SKU</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Categoría</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Precio</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Stock</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => {
                const img = product.imagenes?.[0] ?? "/images/products/product-1.jpg";
                const descuento = product.precio_anterior
                  ? Math.round((1 - product.precio / product.precio_anterior) * 100) : null;
                const isEditing = editingId === product.id;
                return (
                  <tr key={product.id} className={`border-b border-boko-border last:border-0 transition-colors ${isEditing ? "bg-[#796a73]/5" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={img} alt={product.nombre} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        <div>
                          <p className="font-medium text-boko-dark">{product.nombre}</p>
                          {descuento && <span className="text-xs text-green-600 font-medium">{descuento}% OFF</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">{product.sku ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-400">{product.categories?.nombre ?? "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-boko-dark">${product.precio.toLocaleString("es-CO")}</span>
                        {product.precio_anterior && <span className="text-xs text-gray-400 line-through">${product.precio_anterior.toLocaleString("es-CO")}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.stock === 0 ? "bg-red-50 text-red-500" : product.stock <= 5 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
                        {product.stock === 0 ? "Sin stock" : `${product.stock} uds.`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <a href={`/tienda/${product.slug}`} target="_blank" className="text-gray-400 text-xs hover:underline">Ver</a>
                        <button onClick={() => isEditing ? closeEdit() : openEdit(product)} className={`text-xs font-medium hover:underline ${isEditing ? "text-gray-400" : "text-[#796a73]"}`}>
                          {isEditing ? "Cerrar" : "Editar"}
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-400 text-xs hover:underline font-medium">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
