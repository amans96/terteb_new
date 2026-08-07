// src/comp/Hero.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const QUOTES = [
  {
    id: 1,
    quotes: "Order smarter. Eat faster. Enjoy better.",
    picture: "/images/hero.jpg",
  },
  {
    id: 2,
    quotes: "Because great meals should come without waiting",
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
    }, 3000);

    return () => clearInterval(interval);

  }, [imagesLoaded]);


  if (!imagesLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }


  return (
    <div className="relative h-screen overflow-hidden">


      {/* Background Images */}
      {QUOTES.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out ${
            index === currentIndex
              ? "opacity-100 scale-100"
              : "opacity-0 scale-110"
          }`}
          style={{
            backgroundImage: `url(${item.picture})`,
          }}
        />
      ))}



      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />



      {/* Admin Login Button */}
      <Link
        to="/login"
        className="absolute top-6 right-6 z-20 group flex items-center gap-2 rounded-full 
        bg-white/10 backdrop-blur-md border border-white/30 
        px-4 py-2 text-sm font-medium text-white 
        hover:bg-white hover:text-green-900 
        transition-all duration-300 shadow-lg"
      >
        <ShieldCheck
          size={17}
          className="transition-transform duration-300 group-hover:scale-110"
        />

        <span>Admin</span>
      </Link>




      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">


        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-center">

          <span className="bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 bg-clip-text text-transparent">
            Welcome to
          </span>

          <br />

          <span className="text-white">
            Tertebigna
          </span>

        </h1>



        {/* Quotes */}
        <div className="relative mt-8 w-full max-w-3xl h-40 flex items-center justify-center">

          {QUOTES.map((item, index) => (
            <div
              key={item.id}
              className={`absolute transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-5 scale-95"
              }`}
            >

              <p className="text-xl md:text-3xl text-white font-light italic text-center leading-relaxed px-6">
                {item.quotes}
              </p>


              <span className="text-6xl text-amber-400 absolute bottom-0 right-6 leading-none">
                "
              </span>


            </div>
          ))}


        </div>



        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">

          {QUOTES.map((_, index) => (

            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                index === currentIndex
                  ? "w-8 h-2 bg-amber-400"
                  : "w-2 h-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />

          ))}

        </div>


      </div>


    </div>
  );
}