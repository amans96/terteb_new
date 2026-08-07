import React, { useState } from "react";
import { heroNav } from "../data/heroNav";
import { getCategories } from "../utils/heroNavUtils";

export default function HeroNav({
    section,
    setSection,
    selectedCategory,
    setSelectedCategory
}) {

  return (
    <div className="w-full  mt-5 flex flex-col items-center gap-8">

      {/* Top Navigation */}
      <div className="flex bg-white rounded-full shadow-lg overflow-hidden">

        {Object.entries(heroNav).map(([key, value]) => (
          <button
            key={key}
            onClick={() => {
              setSection(key);
              setSelectedCategory("All");
            }}
            className={`px-10 py-3 font-semibold transition duration-300 cursor-pointer
            ${
              section === key
                ? "bg-green-900 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {value.label}
          </button>
        ))}

      </div>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3">

        {getCategories(section).map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedCategory(item.name)}
            className={`px-6 py-2 rounded-full border transition duration-300 cursor-pointer
            ${
              selectedCategory === item.name
                ? "bg-green-900 text-white border-black"
                : "bg-white text-gray-700 border-gray-300 hover:border-amber-500 hover:text-amber-500"
            }`}
          >
            {item.name}
          </button>
        ))}

      </div>

    </div>
  );
}