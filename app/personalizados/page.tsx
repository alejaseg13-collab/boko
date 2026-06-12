import Image from "next/image";
import Button from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import PersonalizadosForm from "@/components/forms/PersonalizadosForm";

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
      <section className="py-8 md:py-16">
        <div className="max-w-378 mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-5 items-center text-center md:items-start md:text-left">
              <h2 className="font-serif text-4xl md:text-6xl font-bold text-[#796a73] leading-tight">
                Tu historia en<br />cada punto
              </h2>
              <p className="text-gray-400 text-base">Una experiencia de creación personalizada</p>
              <ul className="flex flex-col gap-4 text-base text-gray-400 mt-2 text-left">
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
            <div className="relative flex items-center justify-center min-h-[300px] md:min-h-[420px]">
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
      <section className="py-8 md:py-16">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="bg-boko-cream rounded-3xl shadow-[0_12px_60px_rgba(0,0,0,0.18)] overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">

              {/* Izquierda */}
              <div className="flex flex-col gap-6 p-6 md:p-12 border-b md:border-b-0 md:border-r border-boko-border justify-center">
                <Image
                  src="/images/logo.png"
                  alt="Bokō"
                  width={240}
                  height={110}
                  className="h-24 md:h-36 w-auto object-contain mix-blend-multiply self-start"
                />
                <div>
                  <h2 className="font-serif text-2xl md:text-3xl text-[#796a73] leading-tight">¿Buscas un personaje</h2>
                  <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#796a73] leading-tight">muy específico?</h2>
                </div>
                <p className="text-boko-muted text-sm leading-relaxed text-justify">
                  Cuéntanos todos los detalles de lo que quieres y adjunta algunas referencias. Te responderemos lo antes posible para ayudarte con tu solicitud.
                </p>
              </div>

              {/* Derecha */}
              <div className="flex flex-col gap-5 p-6 md:p-12">
                <h3 className="font-serif text-3xl md:text-3xl text-[#796a73] leading-tight text-center md:text-left">
                  Démosle <span className="font-bold italic">vida a tu idea.</span>
                </h3>
                <PersonalizadosForm />
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
