// src/comp/Hero.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Loader2, ArrowRight, Quote } from "lucide-react";

const QUOTES = [
  {
    id: 1,
    quotes: "Order smarter. Eat faster. Enjoy better.",
    picture: "/images/hero.jpg",
  },
  {
    id: 2,
    quotes: "Because great meals should come without waiting.",
    picture: "/images/hero_2.avif",
  },
  {
    id: 3,
    quotes: "Fresh meals. Better taste. Happy moments.",
    picture: "/images/hero_3.avif",
  },
];

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        await Promise.all(
          QUOTES.map((item) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.src = item.picture;
              img.onload = () => resolve(img);
              img.onerror = () => resolve(null);
            });
          })
        );
        setImagesLoaded(true);
      } catch (error) {
        setImagesLoaded(true);
      }
    };
    preloadImages();
  }, []);

  // Auto slide
  useEffect(() => {
    if (!imagesLoaded) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === QUOTES.length - 1 ? 0 : prev + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [imagesLoaded]);

  // Loading State
  if (!imagesLoaded) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400 mb-4" />
        <p className="text-gray-400 font-medium tracking-widest uppercase text-sm animate-pulse">
          Preparing your experience...
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-black">
      
      {/* ==============================
          BACKGROUND IMAGES
      ============================== */}
      {QUOTES.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
            index === currentIndex
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          }`}
          style={{
            backgroundImage: `url(${item.picture})`,
          }}
        />
      ))}

      {/* Cinematic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/90" />

      {/* ==============================
          THE SECRET ADMIN CORNER
      ============================== */}
      {/* 
        This is a completely transparent box measuring 80x80 pixels. 
        It sits exactly in the top right corner. It has no color, no outline, 
        and no hover effects. Customers cannot see it, but clicking the top 
        right corner of the screen will take you to the admin login. 
      */}
      <Link
        to="/login"
        className="absolute top-0 right-0 w-20 h-20 z-50 cursor-default"
        title="" // Empty title so no tooltip shows on hover
      />


      {/* ==============================
          MAIN CONTENT
      ============================== */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-6 pointer-events-none">
        
        {/* Subheading */}
        <p className="text-amber-400 uppercase tracking-[0.3em] text-sm md:text-base font-semibold mb-4 drop-shadow-lg">
          Welcome to
        </p>

        {/* Brand Name */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 text-center tracking-tight drop-shadow-2xl">
          <span className="bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
            Tertebigna
          </span>
        </h1>

        {/* Quotes Slider */}
        <div className="relative w-full max-w-4xl h-32 flex items-center justify-center mt-2">
          {QUOTES.map((item, index) => (
            <div
              key={item.id}
              className={`absolute flex flex-col items-center transition-all duration-700 ease-out ${
                index === currentIndex
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <Quote className="w-8 h-8 text-amber-400/50 mb-3 rotate-180" />
              <p className="text-xl md:text-3xl text-gray-200 font-light text-center leading-relaxed">
                {item.quotes}
              </p>
            </div>
          ))}
        </div>

        {/* Customer CTA - We add pointer-events-auto here so this button is clickable */}
        <div className="mt-12 opacity-0 animate-[fadeIn_1s_ease-out_0.5s_forwards] pointer-events-auto">
          <Link
            to="/menu" 
            className="group relative inline-flex items-center gap-3 bg-amber-500 hover:bg-amber-400 text-amber-950 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:-translate-y-1"
          >
            Explore Our Menu
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* ==============================
          NAVIGATION / INDICATORS
      ============================== */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {QUOTES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`transition-all duration-500 rounded-full cursor-pointer ${
              index === currentIndex
                ? "w-10 h-1.5 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                : "w-2 h-1.5 bg-white/30 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

    </div>
  );
}