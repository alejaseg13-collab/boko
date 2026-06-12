import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email, nombre } = await req.json();

    await resend.emails.send({
      from: "Bokō <nubia@bokocrochet.com>",
      to: email,
      subject: "¡Bienvenida a Bokō! Tu cupón de 10% OFF",
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: Georgia, serif; background: #f9f6f2; margin: 0; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.08);">

            <div style="background: #796a73; padding: 32px 40px; text-align: center;">
              <img src="https://boko-attt.vercel.app/images/logo.png" alt="Bokō" style="height: 80px; filter: brightness(0) invert(1);" />
            </div>

            <div style="padding: 40px;">
              <h1 style="font-family: Georgia, serif; color: #796a73; font-size: 28px; margin: 0 0 12px;">
                ¡Bienvenida${nombre ? `, ${nombre}` : ""}!
              </h1>
              <p style="color: #666; font-size: 15px; line-height: 1.6; margin: 0 0 32px;">
                Gracias por unirte a Bokō. Para celebrar tu primera compra, te regalamos un cupón de <strong>10% de descuento</strong>.
              </p>

              <div style="background: #f9f6f2; border: 2px dashed #796a73; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <p style="color: #796a73; font-size: 13px; margin: 0 0 8px; letter-spacing: 0.05em;">TU CUPÓN</p>
                <p style="font-family: monospace; font-size: 28px; font-weight: bold; color: #796a73; letter-spacing: 0.15em; margin: 0;">TFBWBOKO10</p>
                <p style="color: #999; font-size: 12px; margin: 12px 0 0;">Válido para un solo uso en tu primera compra</p>
              </div>

              <a href="https://boko-attt.vercel.app/tienda"
                 style="display: block; background: #796a73; color: #fff; text-decoration: none; text-align: center; padding: 16px 32px; border-radius: 12px; font-size: 15px; font-weight: bold; margin-bottom: 24px;">
                Ir a la tienda →
              </a>

              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                Ingresa el código al momento de pagar en el campo "Cupón".<br/>
                Solo puede usarse una vez.
              </p>
            </div>

            <div style="background: #f9f6f2; padding: 20px 40px; text-align: center;">
              <p style="color: #aaa; font-size: 11px; margin: 0;">© 2026 Bokō — Tejer el alma</p>
            </div>
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
