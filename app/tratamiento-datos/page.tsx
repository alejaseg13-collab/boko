export const metadata = {
  title: "Tratamiento de datos — Bokō",
  description: "Política de tratamiento de datos personales de Bokō Crochet, en cumplimiento de la Ley 1581 de 2012.",
};

const sections = [
  {
    title: "1. Responsable del tratamiento",
    content: `Bokō Crochet, con domicilio en Chía, Cundinamarca, Colombia, es responsable del tratamiento de los datos personales recopilados a través de su sitio web bokocrochet.com y sus canales de atención.

Para ejercer tus derechos o resolver dudas sobre el tratamiento de tus datos puedes contactarnos en:
• Correo: nubia@bokocrochet.com
• WhatsApp: +57 322 2284303`,
  },
  {
    title: "2. Marco legal",
    content: `Esta política se rige por la Ley Estatutaria 1581 de 2012 de la República de Colombia (Protección de Datos Personales), el Decreto Reglamentario 1377 de 2013 y demás normas complementarias.

Al registrarte en nuestra plataforma o enviar un formulario, declaras haber leído, entendido y aceptado esta política de tratamiento de datos.`,
  },
  {
    title: "3. Datos que recopilamos",
    content: `Bokō recopila los siguientes datos personales según el tipo de interacción:

Al registrarte:
• Nombre y apellidos
• Correo electrónico
• Contraseña (almacenada de forma cifrada)
• Número de teléfono (opcional)

Al realizar una compra:
• Dirección de entrega (departamento, ciudad, código postal)
• Información de facturación
• Historial de pedidos

Al contactarnos por formulario:
• Nombre completo
• Correo electrónico
• Mensaje o descripción de la solicitud
• Archivos adjuntos enviados voluntariamente (en pedidos personalizados)`,
  },
  {
    title: "4. Finalidades del tratamiento",
    content: `Los datos personales recopilados son utilizados exclusivamente para:

• Gestionar y procesar los pedidos realizados en la tienda.
• Coordinar el despacho y seguimiento de los envíos.
• Enviar confirmaciones de compra y actualizaciones de estado del pedido.
• Responder consultas, solicitudes y pedidos personalizados.
• Enviar comunicaciones comerciales sobre promociones, descuentos o novedades del catálogo (solo si el usuario se ha registrado voluntariamente y no ha ejercido su derecho de exclusión).
• Cumplir con obligaciones legales y fiscales aplicables.`,
  },
  {
    title: "5. Autorización del titular",
    content: `Bokō recopila datos personales previa autorización expresa del titular, otorgada a través del marcado del checkbox de aceptación de términos y condiciones presente en los formularios del sitio web.

Esta autorización puede ser revocada en cualquier momento mediante solicitud escrita al correo nubia@bokocrochet.com, sin que ello afecte la legalidad del tratamiento realizado con anterioridad.`,
  },
  {
    title: "6. Transferencia y compartición de datos",
    content: `Bokō no vende, alquila ni comercializa los datos personales de sus usuarios.

Los datos podrán ser compartidos únicamente con:
• Operadoras logísticas y empresas de mensajería, para efectuar el despacho de los pedidos.
• Pasarelas de pago (ePayco), para procesar las transacciones de forma segura.
• Proveedores de servicios tecnológicos que apoyan la operación del sitio (Supabase, Vercel, Resend), bajo estrictos acuerdos de confidencialidad.
• Autoridades competentes, cuando así lo exija la ley colombiana.

Todos los proveedores mencionados cumplen con estándares de seguridad reconocidos internacionalmente.`,
  },
  {
    title: "7. Tiempo de conservación",
    content: `Los datos personales serán conservados durante el tiempo necesario para cumplir con las finalidades descritas en esta política y las obligaciones legales aplicables.

Una vez finalizada la relación comercial y vencidos los plazos legales, los datos serán eliminados de forma segura o anonimizados.`,
  },
  {
    title: "8. Derechos del titular",
    content: `Como titular de los datos personales, tienes derecho a:

• Conocer, actualizar y rectificar tus datos personales.
• Solicitar la supresión de tus datos cuando no exista una obligación legal de conservarlos.
• Revocar la autorización otorgada para el tratamiento de datos.
• Acceder gratuitamente a tus datos personales que hayan sido objeto de tratamiento.
• Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la normativa de protección de datos.

Para ejercer cualquiera de estos derechos, escríbenos a nubia@bokocrochet.com indicando tu nombre completo, correo electrónico registrado y la solicitud específica. Atenderemos tu solicitud en un plazo máximo de 15 días hábiles.`,
  },
  {
    title: "9. Seguridad de los datos",
    content: `Bokō implementa medidas técnicas y organizativas razonables para proteger los datos personales contra accesos no autorizados, pérdida, alteración o divulgación indebida.

Las contraseñas de los usuarios se almacenan de forma cifrada y nunca son accesibles en texto plano. Las conexiones al sitio web están protegidas mediante HTTPS.

Sin embargo, ningún sistema de transmisión de datos por internet es completamente seguro. Si detectas alguna vulnerabilidad o uso indebido de tus datos, comunícalo de inmediato a nubia@bokocrochet.com.`,
  },
  {
    title: "10. Cookies y tecnologías similares",
    content: `El sitio web de Bokō puede utilizar cookies técnicas necesarias para el funcionamiento de la plataforma (gestión de sesión, carrito de compras). No utilizamos cookies de seguimiento publicitario de terceros.

Puedes configurar tu navegador para rechazar las cookies, aunque esto puede afectar el funcionamiento de algunas funcionalidades del sitio.`,
  },
  {
    title: "11. Modificaciones a esta política",
    content: `Bokō se reserva el derecho de actualizar esta Política de Tratamiento de Datos en cualquier momento, para reflejar cambios en la legislación aplicable o en nuestras prácticas internas.

Las modificaciones entrarán en vigencia desde su publicación en el sitio web. Te recomendamos revisar esta página periódicamente.`,
  },
  {
    title: "12. Autoridad de control",
    content: `En Colombia, la autoridad encargada de velar por la protección de datos personales es la Superintendencia de Industria y Comercio (SIC).

Si consideras que tus derechos han sido vulnerados y no has obtenido una respuesta satisfactoria por nuestra parte, puedes presentar una queja directamente ante la SIC a través del sitio web www.sic.gov.co.`,
  },
];

export default function TratamientoDatosPage() {
  return (
    <div className="max-w-215 mx-auto px-6 md:px-10 py-12 md:py-20">

      <div className="mb-10 md:mb-14">
        <p className="text-xs font-medium text-[#796a73]/60 uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-serif text-4xl md:text-5xl text-[#796a73] leading-tight mb-4">
          Tratamiento<br /><span className="font-bold">de datos</span>
        </h1>
        <p className="text-sm text-[#796a73]/60">Última actualización: junio de 2026</p>
      </div>

      <div className="flex flex-col gap-10">
        {sections.map(({ title, content }) => (
          <section key={title} className="flex flex-col gap-3">
            <h2 className="font-semibold text-[#796a73] text-base">{title}</h2>
            <div className="text-sm text-[#796a73]/70 leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-14 pt-8 border-t border-[#796a73]/10 text-center">
        <p className="text-xs text-[#796a73]/50">© 2026 Bokō — Tejer el alma · nubia@bokocrochet.com</p>
      </div>

    </div>
  );
}
