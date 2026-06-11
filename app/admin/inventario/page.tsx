"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

type Material = {
  id: string;
  nombre: string;
  tipo: string;
  color: string | null;
  stock: number;
  unidad: string;
  precio_unit: number;
};

type RecipeRow = {
  id: string;
  product_id: string;
  material_id: string;
  cantidad: number;
  materials: { nombre: string; color: string | null; unidad: string; precio_unit: number } | null;
};

type Producto = {
  id: string;
  nombre: string;
  imagenes: string[];
  precio: number;
  tiempo_entrega_dias: number;
  recetas: RecipeRow[];
  tiempoHrs: number;
  valorHora: number;
};

const tipos   = ["Hilo", "Relleno", "Accesorio", "Botón", "Otro"];
const unidades = ["metros", "gramos", "unidades", "cm"];
const TABS    = ["Materiales", "Recetas y costos", "Tiempos y precios"] as const;

function fmt(n: number) { return "$" + Math.round(n).toLocaleString("es-CO"); }

const inp = "px-2.5 py-1.5 rounded-lg border border-boko-border text-sm focus:outline-none focus:border-[#796a73] bg-white w-full";

// ─── Editable material row ────────────────────────────────────────────────────

function EditableMatRow({
  mat, editing, onEdit, onSave, onCancel, onDelete,
}: {
  mat: Material;
  editing: boolean;
  onEdit: () => void;
  onSave: (u: Partial<Material>) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState({ ...mat });
  const inp2 = "px-2 py-1 rounded-lg border border-boko-border text-xs focus:outline-none focus:border-[#796a73] bg-white w-full";

  if (editing) {
    return (
      <tr className="border-b border-boko-border bg-[#796a73]/5">
        <td className="px-3 py-3"><input className={inp2} value={draft.nombre} onChange={e => setDraft(p=>({...p,nombre:e.target.value}))} /></td>
        <td className="px-3 py-3">
          <select className={inp2} value={draft.tipo} onChange={e => setDraft(p=>({...p,tipo:e.target.value}))}>
            {tipos.map(t => <option key={t}>{t}</option>)}
          </select>
        </td>
        <td className="px-3 py-3"><input className={inp2} value={draft.color ?? ""} onChange={e => setDraft(p=>({...p,color:e.target.value}))} /></td>
        <td className="px-3 py-3"><input className={inp2} type="number" value={draft.stock} onChange={e => setDraft(p=>({...p,stock:+e.target.value}))} /></td>
        <td className="px-3 py-3">
          <select className={inp2} value={draft.unidad} onChange={e => setDraft(p=>({...p,unidad:e.target.value}))}>
            {unidades.map(u => <option key={u}>{u}</option>)}
          </select>
        </td>
        <td className="px-3 py-3"><input className={inp2} type="number" value={draft.precio_unit} onChange={e => setDraft(p=>({...p,precio_unit:+e.target.value}))} /></td>
        <td className="px-3 py-3 text-xs text-gray-500">{fmt(draft.stock * draft.precio_unit)}</td>
        <td className="px-3 py-3">
          <div className="flex gap-2">
            <button onClick={() => onSave(draft)} className="text-xs text-green-600 font-medium hover:underline">Guardar</button>
            <button onClick={onCancel} className="text-xs text-gray-400 hover:underline">Cancelar</button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-boko-border last:border-0 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3.5 text-boko-dark font-medium">{mat.nombre}</td>
      <td className="px-4 py-3.5">
        <span className="px-2 py-0.5 rounded-full text-xs bg-[#796a73]/10 text-[#796a73] font-medium">{mat.tipo}</span>
      </td>
      <td className="px-4 py-3.5 text-gray-500">{mat.color ?? "—"}</td>
      <td className="px-4 py-3.5">
        <span className={`font-medium ${mat.stock < 50 ? "text-red-500" : mat.stock < 150 ? "text-amber-600" : "text-green-600"}`}>
          {mat.stock}
        </span>
      </td>
      <td className="px-4 py-3.5 text-gray-400">{mat.unidad}</td>
      <td className="px-4 py-3.5 text-gray-600">{fmt(mat.precio_unit)}</td>
      <td className="px-4 py-3.5 font-medium text-boko-dark">{fmt(mat.stock * mat.precio_unit)}</td>
      <td className="px-4 py-3.5">
        <div className="flex gap-3">
          <button onClick={onEdit}   className="text-[#796a73] text-xs font-medium hover:underline">Editar</button>
          <button onClick={onDelete} className="text-red-400 text-xs font-medium hover:underline">Eliminar</button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InventarioPage() {
  const [tab, setTab] = useState<typeof TABS[number]>("Materiales");
  const [mats, setMats] = useState<Material[]>([]);
  const [prods, setProds] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMatId, setEditMatId] = useState<string | null>(null);
  const [addingMat, setAddingMat] = useState(false);
  const [newMat, setNewMat] = useState<Omit<Material, "id">>({ nombre: "", tipo: "Hilo", color: "", stock: 0, unidad: "metros", precio_unit: 0 });

  useEffect(() => {
    async function load() {
      const [{ data: materials }, { data: products }, { data: recipes }] = await Promise.all([
        supabase.from("materials").select("*").order("tipo").order("nombre"),
        supabase.from("products").select("id, nombre, imagenes, precio, tiempo_entrega_dias").order("nombre"),
        supabase.from("product_recipes").select("id, product_id, material_id, cantidad, materials(nombre, color, unidad, precio_unit)"),
      ]);

      setMats((materials as Material[]) ?? []);

      const prodsWithRecetas: Producto[] = ((products ?? []) as Omit<Producto, "recetas" | "tiempoHrs" | "valorHora">[]).map(p => ({
        ...p,
        tiempoHrs: 3,
        valorHora: 8000,
        recetas: ((recipes ?? []) as RecipeRow[]).filter(r => r.product_id === p.id),
      }));
      setProds(prodsWithRecetas);
      setLoading(false);
    }
    load();
  }, []);

  // ── Material CRUD ─────────────────────────────────────────────────────────

  async function saveMat(id: string, updated: Partial<Material>) {
    await supabase.from("materials").update({
      nombre: updated.nombre,
      tipo: updated.tipo,
      color: updated.color || null,
      stock: updated.stock,
      unidad: updated.unidad,
      precio_unit: updated.precio_unit,
    }).eq("id", id);
    setMats(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
    setEditMatId(null);
  }

  async function deleteMat(id: string) {
    if (!confirm("¿Eliminar este material?")) return;
    await supabase.from("materials").delete().eq("id", id);
    setMats(prev => prev.filter(m => m.id !== id));
  }

  async function addMat() {
    const { data } = await supabase.from("materials").insert({
      nombre: newMat.nombre,
      tipo: newMat.tipo,
      color: newMat.color || null,
      stock: newMat.stock,
      unidad: newMat.unidad,
      precio_unit: newMat.precio_unit,
    }).select().single();
    if (data) setMats(prev => [...prev, data as Material]);
    setNewMat({ nombre: "", tipo: "Hilo", color: "", stock: 0, unidad: "metros", precio_unit: 0 });
    setAddingMat(false);
  }

  // ── Recipe quantity update ────────────────────────────────────────────────

  async function updateRecipeCantidad(recipeId: string, prodId: string, ri: number, qty: number) {
    await supabase.from("product_recipes").update({ cantidad: qty }).eq("id", recipeId);
    setProds(prev => prev.map(p => p.id === prodId ? {
      ...p,
      recetas: p.recetas.map((r, xi) => xi === ri ? { ...r, cantidad: qty } : r),
    } : p));
  }

  // ── Product price/time update ─────────────────────────────────────────────

  async function saveProd(id: string, updates: Partial<{ precio: number; tiempo_entrega_dias: number; tiempoHrs: number; valorHora: number }>) {
    const dbUpdates: Partial<{ precio: number; tiempo_entrega_dias: number }> = {};
    if (updates.precio !== undefined) dbUpdates.precio = updates.precio;
    if (updates.tiempo_entrega_dias !== undefined) dbUpdates.tiempo_entrega_dias = updates.tiempo_entrega_dias;
    if (Object.keys(dbUpdates).length > 0) {
      await supabase.from("products").update(dbUpdates).eq("id", id);
    }
    setProds(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }

  // ── Cost helpers ──────────────────────────────────────────────────────────

  function costoMat(prod: Producto) {
    return prod.recetas.reduce((acc, r) => {
      const m = r.materials;
      return acc + (m ? m.precio_unit * r.cantidad : 0);
    }, 0);
  }
  function costoTotal(prod: Producto) { return costoMat(prod) + prod.tiempoHrs * prod.valorHora; }
  function margen(prod: Producto) {
    const c = costoTotal(prod);
    if (prod.precio === 0) return 0;
    return Math.round(((prod.precio - c) / prod.precio) * 100);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/4" />
        <div className="h-12 bg-gray-100 rounded-xl w-80" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-[#796a73]">Inventario</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? "bg-white text-[#796a73] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Materiales ────────────────────────────────────────────── */}
      {tab === "Materiales" && (
        <div className="flex flex-col gap-4">
          <div className="flex justify-end">
            <button
              onClick={() => setAddingMat(true)}
              className="px-4 py-2 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity flex items-center gap-2"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Agregar material
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-boko-border">
                  {["Material", "Tipo", "Color", "Stock", "Unidad", "Precio/Unidad", "Valor total", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {addingMat && (
                  <tr className="border-b border-boko-border bg-[#796a73]/5">
                    <td className="px-3 py-3"><input className={inp} placeholder="Nombre" value={newMat.nombre} onChange={e => setNewMat(p=>({...p,nombre:e.target.value}))} /></td>
                    <td className="px-3 py-3">
                      <select className={inp} value={newMat.tipo} onChange={e => setNewMat(p=>({...p,tipo:e.target.value}))}>
                        {tipos.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3"><input className={inp} placeholder="Color" value={newMat.color ?? ""} onChange={e => setNewMat(p=>({...p,color:e.target.value}))} /></td>
                    <td className="px-3 py-3"><input className={inp} type="number" value={newMat.stock} onChange={e => setNewMat(p=>({...p,stock:+e.target.value}))} /></td>
                    <td className="px-3 py-3">
                      <select className={inp} value={newMat.unidad} onChange={e => setNewMat(p=>({...p,unidad:e.target.value}))}>
                        {unidades.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-3"><input className={inp} type="number" value={newMat.precio_unit} onChange={e => setNewMat(p=>({...p,precio_unit:+e.target.value}))} /></td>
                    <td className="px-3 py-3 text-gray-400">—</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <button onClick={addMat} className="text-xs text-green-600 font-medium hover:underline">Guardar</button>
                        <button onClick={() => setAddingMat(false)} className="text-xs text-gray-400 hover:underline">Cancelar</button>
                      </div>
                    </td>
                  </tr>
                )}
                {mats.map(m => (
                  <EditableMatRow
                    key={m.id}
                    mat={m}
                    editing={editMatId === m.id}
                    onEdit={() => setEditMatId(m.id)}
                    onSave={upd => saveMat(m.id, upd)}
                    onCancel={() => setEditMatId(null)}
                    onDelete={() => deleteMat(m.id)}
                  />
                ))}
                {mats.length === 0 && !addingMat && (
                  <tr><td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">Sin materiales. ¡Agrega el primero!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Tab 2: Recetas y costos ──────────────────────────────────────── */}
      {tab === "Recetas y costos" && (
        <div className="flex flex-col gap-6">
          {prods.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Sin productos. Agrega productos primero desde la sección de productos.</p>
          )}
          {prods.map(prod => {
            const cm = costoMat(prod);
            const ct = costoTotal(prod);
            return (
              <div key={prod.id} className="bg-white rounded-2xl border border-boko-border overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-4 border-b border-boko-border bg-gray-50">
                  {prod.imagenes?.[0] && (
                    <img src={prod.imagenes[0]} className="w-10 h-10 rounded-lg object-cover" alt={prod.nombre} />
                  )}
                  <span className="font-semibold text-boko-dark text-sm">{prod.nombre}</span>
                  <div className="ml-auto flex gap-4 text-xs text-gray-500">
                    <span>Costo materiales: <strong className="text-boko-dark">{fmt(cm)}</strong></span>
                    <span>Costo total: <strong className="text-boko-dark">{fmt(ct)}</strong></span>
                  </div>
                </div>

                {prod.recetas.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-gray-400">Sin receta definida para este producto.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-boko-border">
                        <th className="text-left px-6 py-2.5 text-xs text-gray-400 font-medium">Material</th>
                        <th className="text-left px-6 py-2.5 text-xs text-gray-400 font-medium">Cantidad</th>
                        <th className="text-left px-6 py-2.5 text-xs text-gray-400 font-medium">Unidad</th>
                        <th className="text-left px-6 py-2.5 text-xs text-gray-400 font-medium">Precio unit.</th>
                        <th className="text-left px-6 py-2.5 text-xs text-gray-400 font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prod.recetas.map((r, ri) => {
                        const m = r.materials;
                        if (!m) return null;
                        return (
                          <tr key={r.id} className="border-b border-boko-border last:border-0">
                            <td className="px-6 py-3 text-boko-dark">
                              <span className="font-medium">{m.nombre}</span>
                              {m.color && <span className="text-gray-400 ml-1">({m.color})</span>}
                            </td>
                            <td className="px-6 py-3">
                              <input
                                type="number"
                                value={r.cantidad}
                                onChange={e => updateRecipeCantidad(r.id, prod.id, ri, +e.target.value)}
                                className="w-20 px-2 py-1 rounded-lg border border-boko-border text-sm focus:outline-none focus:border-[#796a73]"
                              />
                            </td>
                            <td className="px-6 py-3 text-gray-400">{m.unidad}</td>
                            <td className="px-6 py-3 text-gray-500">{fmt(m.precio_unit)}</td>
                            <td className="px-6 py-3 font-medium text-boko-dark">{fmt(m.precio_unit * r.cantidad)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                <div className="flex items-center gap-6 px-6 py-3 border-t border-boko-border bg-gray-50 text-sm text-gray-500 flex-wrap gap-y-2">
                  <span className="font-medium text-boko-dark">Mano de obra:</span>
                  <label className="flex items-center gap-2">
                    Horas:
                    <input type="number" value={prod.tiempoHrs} step="0.5" onChange={e => saveProd(prod.id, { tiempoHrs: +e.target.value })}
                      className="w-16 px-2 py-1 rounded-lg border border-boko-border text-sm focus:outline-none focus:border-[#796a73]" />
                  </label>
                  <label className="flex items-center gap-2">
                    Valor/hora:
                    <input type="number" value={prod.valorHora} step="500" onChange={e => saveProd(prod.id, { valorHora: +e.target.value })}
                      className="w-24 px-2 py-1 rounded-lg border border-boko-border text-sm focus:outline-none focus:border-[#796a73]" />
                  </label>
                  <span>Costo MO: <strong className="text-boko-dark">{fmt(prod.tiempoHrs * prod.valorHora)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab 3: Tiempos y precios ─────────────────────────────────────── */}
      {tab === "Tiempos y precios" && (
        <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
          {prods.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-400">Sin productos.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-boko-border">
                  {["Producto","Costo materiales","Costo MO","Costo total","Precio venta","Margen","T. producción","T. entrega"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-gray-400 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {prods.map(prod => {
                  const cm = costoMat(prod);
                  const mo = prod.tiempoHrs * prod.valorHora;
                  const ct = cm + mo;
                  const mg = margen(prod);
                  return (
                    <tr key={prod.id} className="border-b border-boko-border last:border-0">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {prod.imagenes?.[0] && (
                            <img src={prod.imagenes[0]} className="w-9 h-9 rounded-lg object-cover shrink-0" alt="" />
                          )}
                          <span className="text-boko-dark font-medium text-xs leading-tight">{prod.nombre}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs">{fmt(cm)}</td>
                      <td className="px-4 py-4 text-gray-500 text-xs">{fmt(mo)}</td>
                      <td className="px-4 py-4 font-medium text-boko-dark text-xs">{fmt(ct)}</td>
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          value={prod.precio}
                          step="1000"
                          onChange={e => saveProd(prod.id, { precio: +e.target.value })}
                          className="w-24 px-2 py-1 rounded-lg border border-boko-border text-xs focus:outline-none focus:border-[#796a73]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          mg < 0 ? "bg-red-50 text-red-500" : mg < 20 ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"
                        }`}>{mg}%</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={prod.tiempoHrs}
                            step="0.5"
                            onChange={e => saveProd(prod.id, { tiempoHrs: +e.target.value })}
                            className="w-16 px-2 py-1 rounded-lg border border-boko-border text-xs focus:outline-none focus:border-[#796a73]"
                          />
                          <span className="text-xs text-gray-400">hrs</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={prod.tiempo_entrega_dias}
                            onChange={e => saveProd(prod.id, { tiempo_entrega_dias: +e.target.value })}
                            className="w-14 px-2 py-1 rounded-lg border border-boko-border text-xs focus:outline-none focus:border-[#796a73]"
                          />
                          <span className="text-xs text-gray-400">días</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
