"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    title: "Kelola Keuangan\nLebih Pintar",
    description:
      "Fitur lengkap untuk mencatat, merencanakan, dan menganalisa arus kas Anda.",
    image: "/illustration/Money income-bro.svg",
  },
  {
    title: "Mulai Perjalanan\nFinansialmu",
    description:
      "Bergabunglah dengan ribuan orang yang telah mengubah cara mereka mengelola uang.",
    image: "/illustration/Instant information-pana.svg",
  },
  {
    title: "Laporan Cerdas\nBerbasis AI",
    description:
      "Dapatkan insight otomatis tentang kebiasaan belanja dan rekomendasi cara berhemat.",
    image: "/illustration/Data report-pana.svg",
  },
];

export function AuthSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative z-10 flex flex-col items-center justify-center w-full my-auto">
      <div className="w-full max-w-[440px] aspect-square relative mb-8">
        {SLIDES.map((slide, index) => (
          <div
            key={`img-${index}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentSlide
                ? "opacity-100"
                : "opacity-0 pointer-events-none",
            )}
          >
            <Image
              src={slide.image}
              alt={slide.title.replace("\n", " ")}
              fill
              className="object-contain drop-shadow-2xl"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="text-center w-full max-w-md relative min-h-[160px]">
        {SLIDES.map((slide, index) => (
          <div
            key={`text-${index}`}
            className={cn(
              "absolute inset-x-0 top-0 transition-all duration-700 ease-in-out",
              index === currentSlide
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none",
            )}
          >
            <h2 className="text-4xl font-black text-white leading-tight whitespace-pre-line mb-4">
              {slide.title}
            </h2>
            <p className="text-white/60 font-medium px-4 text-lg">
              {slide.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-center mt-2 z-20">
        {SLIDES.map((_, index) => (
          <button
            key={`dot-${index}`}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-500",
              index === currentSlide
                ? "w-8 bg-primary"
                : "w-2 bg-white/20 hover:bg-white/40 cursor-pointer",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
