"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Order = {
  id: string;
  created_at: string;
  total: number;
  status: string;
  profiles: { nombre: string | null; apellidos: string | null; email: string | null } | null;
};

const statusColor: Record<string, string> = {
  "En camino":  "bg-blue-50 text-blue-600",
  "Procesando": "bg-amber-50 text-amber-600",
  "Entregado":  "bg-green-50 text-green-600",
  "Cancelado":  "bg-red-50 text-red-500",
};

const allStatuses = ["Todos", "En camino", "Procesando", "Entregado", "Cancelado"];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminPedidosPage() {
  const [filter, setFilter] = useState("Todos");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("orders")
        .select("id, created_at, total, status, profiles(nombre, apellidos, email)")
        .order("created_at", { ascending: false });
      setOrders((data as Order[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === "Todos" ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-serif text-2xl font-bold text-[#796a73]">Gestión de pedidos</h1>
        <div className="flex gap-2 flex-wrap">
          {allStatuses.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s
                  ? "bg-[#796a73] text-white"
                  : "bg-white border border-boko-border text-gray-500 hover:border-[#796a73] hover:text-[#796a73]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-boko-muted animate-pulse">Cargando pedidos...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-boko-muted">No hay pedidos.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-boko-border">
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">ID</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Cliente</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Fecha</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Total</th>
                <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Estado</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const p = order.profiles;
                const name = p ? [p.nombre, p.apellidos].filter(Boolean).join(" ") || p.email || "Cliente" : "Cliente";
                return (
                  <tr key={order.id} className="border-b border-boko-border last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-boko-dark text-xs">{order.id.slice(0, 8)}…</td>
                    <td className="px-6 py-4 text-gray-600">{name}</td>
                    <td className="px-6 py-4 text-gray-400">{fmtDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">${order.total.toLocaleString("es-CO")}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a href={`/admin/pedidos/${order.id}`} className="text-[#796a73] text-xs hover:underline font-medium">
                        Ver detalles
                      </a>
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
