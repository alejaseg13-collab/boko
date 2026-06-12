import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, nombre } = await req.json();

    await resend.emails.send({
      from: "Bokō <nubia@bokocrochet.com>",
      to: email,
      replyTo: "nubia@bokocrochet.com",
      subject: `Tu cuenta en Bokō ya está lista${nombre ? `, ${nombre}` : ""}`,
      text: `Hola${nombre ? ` ${nombre}` : ""},\n\nTu cuenta en Bokō fue creada correctamente.\n\nComo agradecimiento por registrarte, tenemos un detalle para tu primera compra. Usa el código TFBWBOKO10 al pagar para obtener un 10% de descuento. Es válido una sola vez.\n\nPuedes explorar nuestra tienda en: https://boko-attt.vercel.app/tienda\n\nGracias,\nNubia — Bokō\nnubia@bokocrochet.com`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 40px 20px; background: #ffffff;">
          <div style="max-width: 520px; margin: 0 auto;">

            <p style="font-size: 15px; margin: 0 0 8px;">Hola${nombre ? ` ${nombre}` : ""},</p>

            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
              Tu cuenta en <strong>Bokō</strong> fue creada correctamente.
            </p>

            <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
              Como agradecimiento por registrarte, tenemos un pequeño detalle para tu primera compra.
              Usa el siguiente código al momento de pagar:
            </p>

            <p style="font-family: monospace; font-size: 22px; font-weight: bold; color: #796a73; letter-spacing: 0.1em; margin: 24px 0; padding: 16px; background: #f9f6f2; border-left: 4px solid #796a73;">
              TFBWBOKO10
            </p>

            <p style="font-size: 14px; color: #555; margin: 0 0 24px;">
              Aplica un 10% de descuento en tu primera compra. Solo puede usarse una vez.
            </p>

            <p style="font-size: 15px; margin: 0 0 32px;">
              <a href="https://boko-attt.vercel.app/tienda" style="color: #796a73;">Ver tienda →</a>
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 0 0 24px;" />

            <p style="font-size: 13px; color: #888; margin: 0;">
              Nubia — Bokō<br/>
              <a href="mailto:nubia@bokocrochet.com" style="color: #888;">nubia@bokocrochet.com</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("welcome-email error:", err);
    return NextResponse.json({ error: "Error al enviar email" }, { status: 500 });
  }
}
