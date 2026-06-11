import { Product } from "@/components/ui/ProductCard";

export const products: Product[] = [
  { id: "1",  slug: "hollow-knight",   name: "Hollow Knight crochet",                       price: 85000,  image: "/images/products/product-1.jpg",  badge: "bestseller", category: "Videojuegos / Mediano",  rating: 4.9 },
  { id: "2",  slug: "yoshi-verde",     name: "Yoshi color verde sentado",                   price: 54000,  image: "/images/products/product-2.jpg",  badge: "bestseller", category: "Videojuegos / Mediano",  rating: 4.9 },
  { id: "3",  slug: "miku-hatsune",    name: "Miku Hatsune amigurumi",                      price: 72000,  image: "/images/products/product-3.jpg",  badge: "new",        category: "Anime / Mediano",        rating: 4.8 },
  { id: "4",  slug: "appa-avatar",     name: "Appa de Avatar",                              price: 98000,  image: "/images/products/product-4.jpg",  badge: "bestseller", category: "Series / Grande",        rating: 4.9 },
  { id: "5",  slug: "mandragora-hp",   name: "Mandrágora Harry Potter",                     price: 65000,  image: "/images/products/product-5.jpg",  badge: "new",        category: "Películas / Pequeño",    rating: 4.8 },
  { id: "6",  slug: "osito-artesanal", name: "Osito artesanal multicolor",                  price: 45000,  image: "/images/products/product-6.jpg",               category: "Artesanías / Pequeño",   rating: 4.7 },
  { id: "7",  slug: "pikachu-crochet", name: "Pikachu crochet grande",                      price: 78000,  image: "/images/products/product-7.png",  badge: "new",        category: "Videojuegos / Grande",   rating: 4.8 },
  { id: "8",  slug: "totoro-gris",     name: "Totoro gris Mi vecino Totoro",                price: 89000,  image: "/images/products/product-8.png",               category: "Anime / Grande",         rating: 4.9 },
  { id: "9",  slug: "stitch-azul",     name: "Stitch azul Lilo & Stitch",                   price: 67000,  image: "/images/products/product-9.jpg",  badge: "new",        category: "Películas / Mediano",    rating: 4.8 },
  { id: "10", slug: "bolso-negro-tejido", name: "Bolso negro tejido artesanal",             price: 120000, image: "/images/products/product-10.jpg", badge: "sale",       category: "Accesorios / Mediano",   rating: 4.7 },
  { id: "11", slug: "bolso-azul-tejido",  name: "Bolso azul con perlas",                    price: 135000, image: "/images/products/product-11.jpg", badge: "bestseller", category: "Accesorios / Mediano",   rating: 4.9 },
  { id: "12", slug: "yoshi-standing",     name: "Yoshi con gafas de sol",                   price: 89000,  image: "/images/products/product-12.jpg",              category: "Videojuegos / Mediano",  rating: 4.8 },
];

export const testimonials = [
  {
    id: 1,
    name: "Camila Torres",
    rating: 5,
    comment: "Por fin alguien hace a Hollow Knight y no queda deforme jajaja. Me avisaron por WhatsApp y todo bien. Valió la pena la espera, se nota el cariño.",
  },
  {
    id: 2,
    name: "Sebastián Ruiz",
    rating: 5,
    comment: "Mandé hacer un personaje de un anime súper raro y no hubo problema con nada, me asesoraron con los colores porque yo no sabía cuál elegir.",
  },
  {
    id: 3,
    name: "Valentina Gómez",
    rating: 5,
    comment: "La verdad dudé un poco por el precio comparado con un Funko, pero nada que ver. Pedí un Appa de Avatar y es otro nivel, el tejido está súper.",
  },
  {
    id: 4,
    name: "Andrés Morales",
    rating: 5,
    comment: "Le compré una mandrágora a mi novia porque ama Harry Potter y literal no la suelta. El empaque me llegó oliendo delicioso.",
  },
];
