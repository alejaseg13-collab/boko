"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Order = { id: string; created_at: string; total: number; status: string; order_items: { count: number }[] };

const statusColor: Record<string, string> = {
  "En camino":  "text-[#2D7A5F]",
  "Procesando": "text-[#C07A2D]",
  "Entregado":  "text-gray-500",
  "Cancelado":  "text-red-500",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

export default function HistorialPedidosPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/iniciar-sesion"); return; }

      const { data } = await supabase
        .from("orders")
        .select("id, created_at, total, status, order_items(count)")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      setOrders((data as Order[]) ?? []);
      setLoading(false);
    }
    load();
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-[#796a73]">Historial de pedidos</h1>

      <div className="bg-white rounded-2xl border border-boko-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-boko-muted animate-pulse">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-boko-muted">Aún no tienes pedidos.</p>
            <Link href="/tienda" className="mt-3 inline-block text-sm text-[#796a73] underline">Ir a la tienda</Link>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-boko-border">
                  <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">ID</th>
                  <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Fecha</th>
                  <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Total</th>
                  <th className="text-left px-6 py-3.5 text-xs text-gray-400 font-medium">Estado</th>
                  <th className="px-6 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const itemCount = order.order_items?.[0]?.count ?? 0;
                  return (
                    <tr key={order.id} className="border-b border-boko-border last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-boko-dark">{order.id.slice(0, 8)}…</td>
                      <td className="px-6 py-4 text-gray-400">{fmtDate(order.created_at)}</td>
                      <td className="px-6 py-4 text-gray-400">${order.total.toLocaleString("es-CO")} ({itemCount} prod.)</td>
                      <td className={`px-6 py-4 font-medium ${statusColor[order.status] ?? "text-gray-400"}`}>{order.status}</td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/perfil/pedidos/${order.id}`} className="text-[#E05B7F] text-xs hover:underline">
                          Ver detalles
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
