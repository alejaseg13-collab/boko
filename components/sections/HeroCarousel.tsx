"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type ButtonVariant = "filled-purple" | "outline-purple" | "outline-white" | "filled-dark" | "outline-dark";

interface SlideButton {
  label: string;
  href: string;
  variant: ButtonVariant;
}

interface Slide {
  image: string;
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
    title: ["Detalles", "en cada punto"],
    subtitle: "Esencia en movimiento",
    body: "El balance entre la técnica del crochet y la funcionalidad de tus accesorios. Dale un toque diferente a tu estilo con un compañero tejido, perfectos para tus maletas o llaveros.",
    titleColor: "#4a5e38",
    subtitleColor: "#2B1A0E",
    bodyColor: "#77757f",
    buttons: [
      { label: "Ver tienda", href: "/tienda", variant: "outline-dark" },
    ],
  },
  {
    image: "/images/products/hero-banner-2.png",
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
};

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden h-176.5 rounded-br-[50px]">
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image}
            alt={`${slide.title[0]} ${slide.title[1]}`}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority={i === 0}
          />

          {/* Mobile: centered text, dark color, inline title for natural wrapping */}
          <div className="md:hidden absolute top-[8%] inset-x-6 flex flex-col gap-5 items-center text-center text-boko-dark">
            <h1 className="font-serif leading-[1.1] text-[52px]">
              <span className="font-normal">{slide.title[0]}</span>{" "}
              <span className="font-bold">{slide.title[1]}</span>
            </h1>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <p className="font-serif font-bold text-xl tracking-[0.24px]">{slide.subtitle}</p>
                <p className="text-sm leading-[1.5]">{slide.body}</p>
              </div>
              <div className="flex gap-3 items-center justify-center flex-wrap">
                {slide.buttons.map((btn) => (
                  <a
                    key={btn.label}
                    href={btn.href}
                    className="inline-flex items-center justify-center px-8 py-3 rounded-2xl text-base font-semibold border border-boko-dark text-boko-dark hover:bg-boko-dark hover:text-white transition-colors"
                  >
                    {btn.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: left 40%, per-slide colors */}
          <div
            className="hidden md:flex absolute top-[14.31%] left-[5.95%] right-[60.08%] bottom-[17.71%] flex-col gap-10"
          >
            <h1 className="font-serif leading-[1.1]" style={{ color: slide.titleColor }}>
              <span className="block text-[72px] font-normal">{slide.title[0]}</span>
              <span className="block text-[72px] font-bold">{slide.title[1]}</span>
            </h1>
            <div className="flex flex-col gap-7.5">
              <div className="flex flex-col gap-6">
                <p className="font-serif font-bold text-2xl tracking-[0.24px]" style={{ color: slide.subtitleColor }}>
                  {slide.subtitle}
                </p>
                <p className="text-base leading-[1.47]" style={{ color: slide.bodyColor }}>
                  {slide.body}
                </p>
              </div>
              <div className="flex gap-6.75 items-center flex-wrap">
                {slide.buttons.map((btn) => (
                  <a
                    key={btn.label}
                    href={btn.href}
                    className={`inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-semibold transition-colors w-fit ${desktopButtonStyles[btn.variant]}`}
                  >
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
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-6.5 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
