export const metadata = {
  title: "Política de envíos — Bokō",
  description: "Información sobre tiempos, costos y condiciones de envío en Bokō Crochet.",
};

const sections = [
  {
    title: "1. Cobertura",
    content: `Realizamos envíos a todo el territorio colombiano a través de operadoras logísticas nacionales. Por el momento no realizamos envíos internacionales.`,
  },
  {
    title: "2. Tiempos de entrega",
    content: `Los plazos estimados de entrega son los siguientes, contados a partir del día hábil siguiente a la confirmación del pago:

• Chía y municipios de la Sabana de Bogotá: 1 – 3 días hábiles.
• Bogotá y ciudades principales: 2 – 5 días hábiles.
• Municipios intermedios y zonas apartadas: 5 – 10 días hábiles.

Estos tiempos son estimados y pueden verse afectados por la operadora logística, días festivos, condiciones climáticas o situaciones de fuerza mayor ajenas a Bokō.`,
  },
  {
    title: "3. Costos de envío",
    content: `El costo de envío se calcula automáticamente al momento del pago según la ciudad y el peso del pedido.

En ocasiones especiales y durante promociones puntuales, Bokō puede ofrecer envío gratuito en compras que superen un monto mínimo. Esta condición se informará en el sitio web y en los canales oficiales de comunicación.`,
  },
  {
    title: "4. Seguimiento del pedido",
    content: `Una vez despachado tu pedido, recibirás por correo electrónico el número de guía y el enlace de seguimiento de la operadora logística correspondiente, para que puedas monitorear el estado de tu entrega en tiempo real.`,
  },
  {
    title: "5. Recepción del pedido",
    content: `Al recibir tu pedido te recomendamos:

• Verificar que el empaque esté en buen estado antes de firmar la recepción.
• En caso de que el paquete llegue visiblemente dañado, deja constancia escrita ante el transportador y contáctanos de inmediato.
• Tomar fotografías del estado del paquete antes de abrirlo, como evidencia en caso de reclamo.

Una vez el paquete sea recibido y firmado en buen estado, Bokō no se hace responsable por daños posteriores.`,
  },
  {
    title: "6. Dirección incorrecta o pedido no entregado",
    content: `Si el paquete no puede ser entregado por datos incorrectos proporcionados por el comprador (dirección incompleta, número de contacto erróneo, etc.), los costos adicionales de reenvío correrán por cuenta del cliente.

Si el pedido es devuelto a origen por imposibilidad de entrega, te contactaremos para coordinar un nuevo envío. Los gastos de reenvío serán responsabilidad del cliente.`,
  },
  {
    title: "7. Pedidos personalizados",
    content: `Los pedidos personalizados tienen tiempos de producción adicionales de entre 7 y 21 días hábiles según la complejidad del diseño. El envío se realiza una vez la pieza esté finalizada y aprobada por el cliente.

Para mayor información sobre pedidos personalizados consulta nuestros Términos y Condiciones o escríbenos directamente.`,
  },
  {
    title: "8. Contacto",
    content: `Si tienes dudas sobre el estado de tu pedido o necesitas asistencia con el envío, puedes contactarnos a través de:

• Correo: nubia@bokocrochet.com
• WhatsApp: +57 322 2284303
• Horario de atención: lunes a sábado, 8:00 a.m. – 8:00 p.m.`,
  },
];

export default function PoliticaEnviosPage() {
  return (
    <div className="max-w-215 mx-auto px-6 md:px-10 py-12 md:py-20">

      <div className="mb-10 md:mb-14">
        <p className="text-xs font-medium text-[#796a73]/60 uppercase tracking-widest mb-3">Legal</p>
        <h1 className="font-serif text-4xl md:text-5xl text-[#796a73] leading-tight mb-4">
          Política de<br /><span className="font-bold">envíos</span>
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
