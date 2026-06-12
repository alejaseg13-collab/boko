import Image from "next/image";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

const steps = [
  { num: "01", title: "Cuéntanos tu idea", desc: "Descríbenos el personaje que sueñas, con todos los detalles que quieras." },
  { num: "02", title: "Recibe una cotización", desc: "Te enviamos presupuesto y tiempo estimado de producción en menos de 24h." },
  { num: "03", title: "Aprueba y pagamos", desc: "Confirma el pedido con un anticipo y comenzamos a tejer tu pieza." },
  { num: "04", title: "Recibe tu pieza única", desc: "Recibe tu personaje con seguimiento en tiempo real por WhatsApp." },
];

export default function PersonalizadosPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden h-52 flex items-center justify-center rounded-br-[48px]">
        <Image
          src="/images/products/persdos_res.png"
          alt="Personalizados Bokō"
          fill
          className="md:hidden object-cover object-bottom"
          sizes="100vw"
          priority
        />
        <Image
          src="/images/products/personalizados-banner.jpg"
          alt="Personalizados Bokō"
          fill
          className="hidden md:block object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="relative z-10 text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-white/75 drop-shadow-lg">Personalizados</h1>
        </div>
      </section>

      {/* Intro con imagen */}
      <section className="py-16">
        <div className="max-w-378 mx-auto px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-5">
              <h2 className="font-serif text-6xl font-bold text-[#796a73] leading-tight">
                Tu historia en<br />cada punto
              </h2>
              <p className="text-gray-400 text-base">Una experiencia de creación personalizada</p>
              <ul className="flex flex-col gap-6 text-base text-gray-400 mt-2">
                {[
                  { bold: "Proporciones a medida:", text: "Desde miniaturas hasta versiones muy grandes, adaptamos el volumen y la estructura." },
                  { bold: "Creaciones desde cero:", text: "Si a quien buscas aún no reside en nuestra tienda, le damos vida." },
                  { bold: "Paletas únicas:", text: "Personalizamos el tono de los hilos de cualquier modelo existente." },
                ].map(({ bold, text }) => (
                  <li key={bold} className="flex gap-2">
                    <span className="shrink-0 mt-0.5">•</span>
                    <p><strong className="text-gray-400">{bold}</strong> {text}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Imagen con espiral decorativo */}
            <div className="relative flex items-center justify-center min-h-[420px]">
              {/* Espiral decorativo */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 500 420"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M380,80 C420,100 450,160 430,220 C410,280 350,300 290,280 C230,260 190,200 210,140 C230,80 300,60 360,80 C400,95 420,140 400,180 C380,220 330,230 290,210 C250,190 240,150 265,125 C285,105 320,110 335,135"
                  stroke="#796a73"
                  strokeWidth="18"
                  strokeLinecap="round"
                  opacity="0.25"
                />
                <path
                  d="M120,300 C80,260 90,190 140,160 C180,135 220,150 230,190"
                  stroke="#796a73"
                  strokeWidth="18"
                  strokeLinecap="round"
                  opacity="0.2"
                />
              </svg>
              <Image
                src="/images/products/personalizados-hero.png"
                alt="Pieza personalizada - Koopa crochet"
                width={680}
                height={680}
                className="relative z-10 object-contain"
              />
            </div>
          </div>
        </div>
      </section>


      {/* Formulario */}
      <section className="py-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="bg-boko-cream rounded-3xl shadow-[0_12px_60px_rgba(0,0,0,0.18)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">

              {/* Izquierda */}
              <div className="flex flex-col gap-6 p-12 border-r border-boko-border justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Bokō"
                  width={240}
                  height={110}
                  className="h-36 w-auto object-contain mix-blend-multiply self-start"
                />
                <div>
                  <h2 className="font-serif text-3xl text-[#796a73] leading-tight">¿Buscas un personaje</h2>
                  <h2 className="font-serif text-3xl font-bold text-[#796a73] leading-tight">muy específico?</h2>
                </div>
                <p className="text-boko-muted text-sm leading-relaxed text-justify">
                  Cuéntanos todos los detalles de lo que quieres y adjunta algunas referencias. Te responderemos lo antes posible para ayudarte con tu solicitud.
                </p>
              </div>

              {/* Derecha */}
              <div className="flex flex-col gap-5 p-12">
                <h3 className="font-serif text-3xl text-[#796a73] leading-tight">
                  Démosle <span className="font-bold italic">vida a tu idea.</span>
                </h3>
                <div className="bg-[#f0ece8] rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1 bg-boko-cream rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <label className="text-xs font-medium text-boko-dark">Nombre completo *</label>
                    <input type="text" placeholder="Ingresa tu nombre completo" className="text-sm text-boko-muted placeholder:text-boko-muted bg-transparent focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1 bg-boko-cream rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <label className="text-xs font-medium text-boko-dark">Correo electrónico *</label>
                    <input type="email" placeholder="Ejemplo: nombre@dominio.com" className="text-sm text-boko-muted placeholder:text-boko-muted bg-transparent focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1 bg-boko-cream rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <label className="text-xs font-medium text-boko-dark">Descripción *</label>
                    <textarea rows={3} placeholder="Escribe aquí tu mensaje" className="text-sm text-boko-muted placeholder:text-boko-muted bg-transparent focus:outline-none resize-none" />
                  </div>
                  <div className="flex flex-col gap-2 bg-boko-cream rounded-xl px-4 py-3 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
                    <label className="text-xs font-medium text-boko-dark">Referencias *</label>
                    <div className="border-2 border-dashed border-boko-border rounded-xl p-4 flex flex-col items-center gap-2 text-center">
                      <p className="text-xs font-semibold text-boko-dark">Selecciona o arrastra tu archivo aquí</p>
                      <p className="text-xs text-boko-muted">Se permiten archivos .jpg, .png, .pdf con un tamaño máximo de 3MB</p>
                      <button type="button" className="mt-1 px-5 py-2 rounded-lg bg-[#796a73] text-white text-xs font-medium hover:bg-[#5a4a54] transition-colors">
                        Seleccionar archivo
                      </button>
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 w-5 h-5 rounded accent-[#796a73] shrink-0" />
                  <span className="text-xs text-boko-muted">
                    Acepto la política de privacidad de Boko.
                  </span>
                </label>
                <button type="submit" className="w-fit px-8 py-3 rounded-xl bg-[#796a73] text-white text-sm font-medium hover:bg-[#5a4a54] transition-colors">
                  Enviar
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
