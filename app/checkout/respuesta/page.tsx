"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

function RespuestaContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "rejected">("loading");
  const [ref, setRef] = useState("");

  useEffect(() => {
    const refPayco = params.get("ref_payco") ?? params.get("x_ref_payco") ?? "";
    const state = params.get("x_transaction_state") ?? "";
    setRef(refPayco);

    if (state === "Aceptada") {
      setStatus("success");
      // Limpiar carrito del usuario
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) supabase.from("cart_items").delete().eq("user_id", session.user.id);
        else localStorage.removeItem("boko_cart");
      });
    } else if (state === "Pendiente") {
      setStatus("pending");
    } else {
      setStatus("rejected");
    }
  }, [params]);

  if (status === "loading") {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#796a73] border-t-transparent rounded-full animate-spin" /></div>;
  }

  const config = {
    success: {
      icon: <polyline points="20 6 9 17 4 12" />,
      iconColor: "#6B9E7A",
      iconBg: "bg-[#6B9E7A]/10",
      title: "¡Pago exitoso!",
      message: "Tu pedido ha sido confirmado. Recibirás un correo con los detalles y el seguimiento de tu envío.",
    },
    pending: {
      icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
      iconColor: "#F59E0B",
      iconBg: "bg-yellow-50",
      title: "Pago en proceso",
      message: "Tu pago está siendo verificado. Te notificaremos por correo cuando sea confirmado.",
    },
    rejected: {
      icon: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
      iconColor: "#EF4444",
      iconBg: "bg-red-50",
      title: "Pago rechazado",
      message: "El pago no pudo procesarse. Puedes intentarlo nuevamente o usar otro método de pago.",
    },
  }[status];

  return (
    <div className="max-w-md mx-auto px-6 py-24 text-center flex flex-col items-center gap-6">
      <div className={`w-20 h-20 rounded-full ${config.iconBg} flex items-center justify-center`}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={config.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {config.icon}
        </svg>
      </div>
      <h2 className="font-serif text-3xl font-bold text-boko-dark">{config.title}</h2>
      <p className="text-boko-muted text-sm leading-relaxed">{config.message}</p>
      {ref && <p className="text-xs text-gray-400">Referencia: {ref}</p>}
      <div className="flex gap-3">
        {status === "success" ? (
          <Link href="/perfil/pedidos" className="px-8 py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity">
            Ver mis pedidos
          </Link>
        ) : (
          <Link href="/carrito" className="px-8 py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:opacity-80 transition-opacity">
            Volver al carrito
          </Link>
        )}
        <Link href="/tienda" className="px-8 py-3 rounded-xl border border-boko-border text-boko-dark text-sm font-medium hover:bg-gray-50 transition-colors">
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutRespuestaPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#796a73] border-t-transparent rounded-full animate-spin" /></div>}>
      <RespuestaContent />
    </Suspense>
  );
}
