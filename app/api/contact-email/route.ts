import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const LABELS: Record<string, string> = {
  contacto: "Formulario de Contacto",
  personalizados: "Pedido Personalizado",
  inicio: "Proyecto Especial (Inicio)",
};

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const contentType = req.headers.get("content-type") ?? "";

    let nombre = "", correo = "", descripcion = "", motivo = "", tipo = "";
    let attachments: { filename: string; content: Buffer }[] = [];

    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      nombre = (fd.get("nombre") as string) ?? "";
      correo = (fd.get("correo") as string) ?? "";
      descripcion = (fd.get("descripcion") as string) ?? "";
      motivo = (fd.get("motivo") as string) ?? "";
      tipo = (fd.get("tipo") as string) ?? "";

      const file = fd.get("archivo") as File | null;
      if (file && file.size > 0) {
        const buf = Buffer.from(await file.arrayBuffer());
        attachments = [{ filename: file.name, content: buf }];
      }
    } else {
      const body = await req.json();
      nombre = body.nombre ?? "";
      correo = body.correo ?? "";
      descripcion = body.descripcion ?? "";
      motivo = body.motivo ?? "";
      tipo = body.tipo ?? "";
    }

    const tipoLabel = LABELS[tipo] ?? tipo;
    const subject = motivo
      ? `[${tipoLabel}] ${motivo} — ${nombre}`
      : `[${tipoLabel}] Mensaje de ${nombre}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; color: #333; margin: 0; padding: 32px 20px; background: #f5f0eb;">
        <div style="max-width: 560px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden;">
          <div style="background: #796a73; padding: 24px 32px;">
            <p style="color: #fff; font-size: 13px; margin: 0; opacity: 0.8;">${tipoLabel}</p>
            <h1 style="color: #fff; font-size: 22px; margin: 6px 0 0;">${subject}</h1>
          </div>
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #888; width: 130px;">Nombre</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">${nombre}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #888;">Correo</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #333;"><a href="mailto:${correo}" style="color: #796a73;">${correo}</a></td>
              </tr>
              ${motivo ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 13px; color: #888;">Motivo</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 14px; color: #333;">${motivo}</td>
              </tr>` : ""}
              <tr>
                <td style="padding: 10px 0; font-size: 13px; color: #888; vertical-align: top;">Mensaje</td>
                <td style="padding: 10px 0; font-size: 14px; color: #333; line-height: 1.6; white-space: pre-wrap;">${descripcion}</td>
              </tr>
            </table>
            ${attachments.length > 0 ? `<p style="font-size: 13px; color: #888; margin-top: 20px;">📎 Se adjuntó: <strong>${attachments[0].filename}</strong></p>` : ""}
          </div>
          <div style="padding: 16px 32px; background: #f9f6f3; text-align: center;">
            <p style="font-size: 12px; color: #aaa; margin: 0;">© 2026 Bokō — Tejer el alma</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await resend.emails.send({
      from: "Bokō Web <nubia@bokocrochet.com>",
      to: "nubia@bokocrochet.com",
      replyTo: correo,
      subject,
      html,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact-email error:", err);
    return NextResponse.json({ error: "Error al enviar" }, { status: 500 });
  }
}
