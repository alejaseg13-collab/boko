"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type OrderItem = { id: string; nombre: string; precio: number; cantidad: number; subtotal: number; imagen_url: string | null };
type Order = {
  id: string;
  created_at: string;
  status: string;
  subtotal: number;
  envio: number;
  total: number;
  nota_interna: string | null;
  tiempo_entrega_dias: number;
  shipping_address: Record<string, string> | null;
  order_items: OrderItem[];
  profiles: { nombre: string | null; apellidos: string | null; email: string | null; telefono: string | null } | null;
};

const statuses = ["Procesando", "En camino", "Entregado", "Cancelado"];

const statusColor: Record<string, string> = {
  "Procesando": "bg-amber-50 text-amber-600 border-amber-200",
  "En camino":  "bg-blue-50 text-blue-600 border-blue-200",
  "Entregado":  "bg-green-50 text-green-600 border-green-200",
  "Cancelado":  "bg-red-50 text-red-500 border-red-200",
};

function fmt(n: number) { return "$" + n.toLocaleString("es-CO"); }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPedidoDetallePage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [entregaDias, setEntregaDias] = useState(5);
  const [nota, setNota] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("id, created_at, status, subtotal, envio, total, nota_interna, tiempo_entrega_dias, shipping_address, order_items(id, nombre, precio, cantidad, subtotal, imagen_url), profiles(nombre, apellidos, email, telefono)")
        .eq("id", id as string)
        .single();

      if (data) {
        const o = data as Order;
        setOrder(o);
        setStatus(o.status);
        setEntregaDias(o.tiempo_entrega_dias);
        setNota(o.nota_interna ?? "");
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave() {
    if (!order) return;
    setSaving(true);
    await supabase.from("orders").update({
      status,
      tiempo_entrega_dias: entregaDias,
      nota_interna: nota || null,
    }).eq("id", order.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 bg-gray-100 rounded w-1/3" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-boko-muted">Pedido no encontrado.</p>
        <Link href="/admin/pedidos" className="text-sm text-[#796a73] underline mt-2 inline-block">Volver</Link>
      </div>
    );
  }

  const p = order.profiles;
  const addr = order.shipping_address;
  const clientName = p ? [p.nombre, p.apellidos].filter(Boolean).join(" ") || p.email || "Cliente" : "Cliente";

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#796a73]">Pedido {order.id.slice(0, 8)}…</h1>
          <p className="text-gray-400 text-sm mt-0.5">{fmtDate(order.created_at)}</p>
        </div>
        <Link href="/admin/pedidos" className="text-sm text-boko-dark underline hover:text-[#796a73] transition-colors">
          ← Volver a pedidos
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

        {/* Left */}
        <div className="flex flex-col gap-6">

          {/* Cliente */}
          <div className="bg-white rounded-2xl border border-boko-border p-6">
            <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">Datos del cliente</p>
            <p className="font-semibold text-boko-dark">{clientName}</p>
            {addr && <p className="text-sm text-gray-500 mt-1">{addr.direccion}, {addr.ciudad}</p>}
            <div className="mt-3 flex flex-col gap-1">
              {p?.email && <p className="text-sm text-gray-500">{p.email}</p>}
              {p?.telefono && <p className="text-sm text-gray-500">{p.telefono}</p>}
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-boko-border">
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Producto</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Precio</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Cantidad</th>
                  <th className="text-left px-6 py-3 text-xs text-gray-400 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item) => (
                  <tr key={item.id} className="border-b border-boko-border last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.imagen_url && (
                          <img src={item.imagen_url} className="w-11 h-11 rounded-lg object-cover shrink-0" alt={item.nombre} />
                        )}
                        <span className="text-boko-dark font-medium">{item.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{fmt(item.precio)}</td>
                    <td className="px-6 py-4 text-gray-400">x{item.cantidad}</td>
                    <td className="px-6 py-4 font-semibold text-boko-dark">{fmt(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-boko-border flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Envío</span><span>{order.envio > 0 ? fmt(order.envio) : "Gratis"}</span></div>
              <div className="flex justify-between font-bold text-boko-dark text-base pt-2 border-t border-boko-border mt-1">
                <span>Total</span><span>{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Nota interna */}
          <div className="bg-white rounded-2xl border border-boko-border p-6 flex flex-col gap-3">
            <p className="text-sm font-semibold text-boko-dark">Nota interna</p>
            <textarea
              value={nota}
              onChange={e => setNota(e.target.value)}
              placeholder="Añade una nota sobre este pedido (solo visible para el admin)..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-boko-border text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#796a73] resize-none"
            />
          </div>
        </div>

        {/* Right — Gestión */}
        <div className="flex flex-col gap-4">

          {/* Estado */}
          <div className="bg-white rounded-2xl border border-boko-border p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-boko-dark">Estado del pedido</p>
            <div className="flex flex-col gap-2">
              {statuses.map(s => (
                <label key={s} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                  status === s ? statusColor[s] : "border-boko-border hover:bg-gray-50"
                }`}>
                  <input type="radio" name="status" checked={status === s} onChange={() => setStatus(s)} className="accent-[#796a73]" />
                  <span className="text-sm font-medium">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tiempo de entrega */}
          <div className="bg-white rounded-2xl border border-boko-border p-5 flex flex-col gap-3">
            <p className="text-sm font-semibold text-boko-dark">Tiempo de entrega estimado</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={entregaDias}
                onChange={e => setEntregaDias(+e.target.value)}
                className="w-20 px-3 py-2 rounded-xl border border-boko-border text-sm focus:outline-none focus:border-[#796a73] text-center font-semibold"
              />
              <span className="text-sm text-gray-500">días hábiles</span>
            </div>
            <p className="text-xs text-gray-400">
              Entrega estimada: <strong className="text-boko-dark">
                {new Date(Date.now() + entregaDias * 24 * 60 * 60 * 1000).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
              </strong>
            </p>
          </div>

          {/* Guardar */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-60 ${
              saved ? "bg-green-500 text-white" : "bg-[#796a73] text-white hover:opacity-80"
            }`}
          >
            {saved ? "¡Guardado!" : saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>

      </div>
    </div>
  );
}
