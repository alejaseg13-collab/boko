import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function md5(str: string) {
  return crypto.createHash("md5").update(str).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();

    const x_ref_payco       = body.get("x_ref_payco")?.toString() ?? "";
    const x_transaction_id  = body.get("x_transaction_id")?.toString() ?? "";
    const x_amount          = body.get("x_amount")?.toString() ?? "";
    const x_currency_code   = body.get("x_currency_code")?.toString() ?? "";
    const x_signature       = body.get("x_signature")?.toString() ?? "";
    const x_invoice         = body.get("x_invoice")?.toString() ?? "";    // order ID
    const x_transaction_state = body.get("x_transaction_state")?.toString() ?? "";

    // Validar firma
    const custId   = process.env.NEXT_PUBLIC_EPAYCO_CUSTOMER_ID!;
    const pKey     = process.env.EPAYCO_P_KEY!;
    const expected = md5(`${custId}^${pKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`);

    if (expected !== x_signature) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
    }

    // Mapear estado
    const statusMap: Record<string, string> = {
      Aceptada:  "Pagado",
      Rechazada: "Rechazado",
      Pendiente: "Pendiente pago",
      Fallida:   "Fallido",
    };
    const newStatus = statusMap[x_transaction_state] ?? "Pendiente pago";

    // Actualizar pedido en Supabase
    if (x_invoice) {
      await supabaseAdmin
        .from("orders")
        .update({ status: newStatus, epayco_ref: x_ref_payco } as any)
        .eq("id", x_invoice);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("ePayco confirmacion error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
