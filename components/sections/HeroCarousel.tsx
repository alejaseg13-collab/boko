"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type ButtonVariant = "filled-purple" | "outline-purple" | "outline-white" | "filled-dark" | "outline-dark" | "filled-green";

interface SlideButton {
  label: string;
  href: string;
  variant: ButtonVariant;
}

interface Slide {
  image: string;
  imageMobile: string;
  title: [string, string];
  subtitle: string;
  body: string;
  titleColor: string;
  subtitleColor: string;
  bodyColor: string;
  buttons: SlideButton[];
}

const slides: Slide[] = [
  {
    image: "/images/products/hero-banner-mono.png",
    imageMobile: "/images/products/banner2_res.png",
    title: ["Detalles", "en cada punto"],
    subtitle: "Esencia en movimiento",
    body: "El balance entre la técnica del crochet y la funcionalidad de tus accesorios. Dale un toque diferente a tu estilo con un compañero tejido, perfectos para tus maletas o llaveros.",
    titleColor: "#4a5e38",
    subtitleColor: "#2B1A0E",
    bodyColor: "#77757f",
    buttons: [
      { label: "Ver tienda", href: "/tienda", variant: "filled-green" },
    ],
  },
  {
    image: "/images/products/hero-banner-2.png",
    imageMobile: "/images/products/banner1_res.png",
    title: ["Tu favorito,", "hecho realidad"],
    subtitle: "Catálogo y pedidos a medida",
    body: "Compañeros tejidos con estructura y alma. Si buscas este modelo en una escala diferente o quieres a otro protagonista de tu serie favorita, dinos qué personaje tienes en mente y nosotros nos encargamos del resto.",
    titleColor: "#796a73",
    subtitleColor: "#2d2d2d",
    bodyColor: "#77757f",
    buttons: [
      { label: "Ver tienda", href: "/tienda", variant: "filled-purple" },
      { label: "Personalizar el mío", href: "/personalizados", variant: "outline-purple" },
    ],
  },
  {
    image: "/images/products/hero-banner-2.jpg",
    imageMobile: "/images/products/banner3_res.png",
    title: ["Elegancia", "que te acompaña"],
    subtitle: "Estilo en cada punto",
    body: "Transforma tus accesorios cotidianos con una pieza hecha a mano. Tejido con materiales de alta calidad que soportan el uso exterior sin deshilacharse.",
    titleColor: "#ffffff",
    subtitleColor: "#ffffff",
    bodyColor: "#ffffff",
    buttons: [
      { label: "Ver tienda", href: "/tienda", variant: "outline-white" },
    ],
  },
];

const desktopButtonStyles: Record<ButtonVariant, string> = {
  "filled-purple": "bg-[#796a73] text-white hover:bg-[#5a4a54]",
  "outline-purple": "border border-[#796a73] text-[#796a73] hover:bg-[#796a73] hover:text-white",
  "outline-white": "border border-white text-white hover:bg-white hover:text-[#2B1A0E]",
  "filled-dark": "bg-[#2B1A0E] text-white hover:bg-[#1a0e06]",
  "outline-dark": "border border-[#2B1A0E] text-[#2B1A0E] hover:bg-[#2B1A0E] hover:text-white",
  "filled-green": "bg-[#4a5e38] text-white hover:bg-[#3a4a2a]",
};

const mobileButtonStyles: Record<ButtonVariant, string> = {
  "filled-purple": "bg-[#796a73] text-white",
  "outline-purple": "border border-[#796a73] text-[#796a73]",
  "outline-white": "border border-[#2B1A0E] text-[#2B1A0E]",
  "filled-dark": "bg-[#2B1A0E] text-white",
  "outline-dark": "border border-[#2B1A0E] text-[#2B1A0E]",
  "filled-green": "bg-[#4a5e38] text-white",
};

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <>
      {/* ── MÓVIL: imagen de fondo, texto encima ── */}
      <div className="md:hidden relative h-[140vw] min-h-[500px] bg-[#e8e0dc]">
        <Image src={slide.imageMobile} alt="" fill className="object-cover object-center" sizes="100vw" priority={current === 0} />
        <div className="absolute inset-0 flex flex-col items-center text-center justify-start px-6 pt-10 gap-3">
          <h1 className="font-serif leading-[1.1] text-[36px]" style={{ color: slide.titleColor }}>
            <span className="font-normal block">{slide.title[0]}</span>
            <span className="font-bold block">{slide.title[1]}</span>
          </h1>
          <p className="font-serif font-bold text-lg" style={{ color: slide.subtitleColor }}>
            {slide.subtitle}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: slide.bodyColor }}>
            {slide.body}
          </p>
          <div className="flex gap-3 flex-wrap pt-1 justify-center">
            {slide.buttons.map((btn) => (
              <a key={btn.label} href={btn.href}
                className={`inline-flex items-center justify-center px-6 py-3 rounded-2xl text-sm font-semibold transition-colors ${desktopButtonStyles[btn.variant]}`}>
                {btn.label}
              </a>
            ))}
          </div>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-2 bg-white/50"}`} />
          ))}
        </div>
      </div>

      {/* ── DESKTOP: exactamente igual al original ── */}
      <section className="hidden md:block relative overflow-hidden h-176.5 rounded-br-[50px]">
        {slides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <Image src={slide.image} alt={`${slide.title[0]} ${slide.title[1]}`} fill className="object-cover object-center" sizes="100vw" priority={i === 0} />
            <div className="absolute top-[18%] left-[5.95%] right-[55%] xl:right-[60.08%] bottom-[5%] flex flex-col gap-6 xl:gap-10 overflow-hidden">
              <h1 className="font-serif leading-[1.1]" style={{ color: slide.titleColor }}>
                <span className="block text-[48px] lg:text-[60px] xl:text-[72px] font-normal">{slide.title[0]}</span>
                <span className="block text-[48px] lg:text-[60px] xl:text-[72px] font-bold">{slide.title[1]}</span>
              </h1>
              <div className="flex flex-col gap-5 xl:gap-7.5">
                <div className="flex flex-col gap-4 xl:gap-6">
                  <p className="font-serif font-bold text-lg xl:text-2xl tracking-[0.24px]" style={{ color: slide.subtitleColor }}>{slide.subtitle}</p>
                  <p className="text-sm xl:text-base leading-[1.47] hidden lg:block" style={{ color: slide.bodyColor }}>{slide.body}</p>
                </div>
                <div className="flex gap-4 xl:gap-6.75 items-center flex-wrap">
                  {slide.buttons.map((btn) => (
                    <a key={btn.label} href={btn.href}
                      className={`inline-flex items-center justify-center px-6 xl:px-8 py-3 xl:py-4 rounded-2xl text-sm xl:text-base font-semibold transition-colors w-fit ${desktopButtonStyles[btn.variant]}`}>
                      {btn.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-[13.6%] left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-6.5 bg-white" : "w-2 bg-white/40"}`} />
          ))}
        </div>
      </section>
    </>
  );
}
