import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
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
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin: 0; padding: 0; background-color: #f0ebe6; font-family: Georgia, 'Times New Roman', serif;">
          <div style="max-width: 560px; margin: 40px auto; background-color: #faf7f4; border-radius: 16px; overflow: hidden;">

            <!-- Header banner -->
            <div style="background-color: #796a73; height: 120px; width: 100%;"></div>

            <!-- Content -->
            <div style="padding: 40px 48px 48px;">

              <h1 style="font-family: Georgia, serif; font-size: 28px; font-weight: normal; color: #2c2c2c; margin: 0 0 20px;">
                ¡Hola${nombre ? `, ${nombre}` : ""}!
              </h1>

              <p style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #444; margin: 0 0 28px;">
                Gracias por unirte a Bokō. Para celebrar tu primera compra, te regalamos un cupón de <strong>10% de descuento</strong>.
              </p>

              <!-- Coupon box -->
              <div style="border: 2px dashed #796a73; border-radius: 12px; padding: 24px 20px; text-align: center; margin: 0 0 28px;">
                <p style="font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #796a73; margin: 0 0 10px;">TU CUPÓN</p>
                <p style="font-family: Arial, sans-serif; font-size: 26px; font-weight: bold; letter-spacing: 0.18em; color: #2c2c2c; margin: 0 0 10px;">TFBWBOKO10</p>
                <p style="font-family: Arial, sans-serif; font-size: 12px; color: #888; margin: 0;">Válido para un solo uso en tu primera compra</p>
              </div>

              <!-- CTA button -->
              <a href="https://bokocrochet.com/tienda" style="display: block; background-color: #796a73; color: #ffffff; text-align: center; text-decoration: none; font-family: Arial, sans-serif; font-size: 15px; padding: 16px 24px; border-radius: 10px; margin: 0 0 24px;">
                Ir a la tienda →
              </a>

              <p style="font-family: Arial, sans-serif; font-size: 12px; color: #999; text-align: center; line-height: 1.6; margin: 0;">
                Ingresa el código al momento de pagar en el campo "Cupón".<br/>Solo puede usarse una vez.
              </p>

            </div>

            <!-- Footer -->
            <div style="padding: 20px 48px; text-align: center; border-top: 1px solid #e8e2de;">
              <p style="font-family: Arial, sans-serif; font-size: 12px; color: #aaa; margin: 0;">
                © 2026 Bokō — Tejer el alma
              </p>
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
