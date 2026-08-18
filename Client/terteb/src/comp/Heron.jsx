import React, { useState, useEffect } from "react"; 
import { heroNav } from "../data/heroNav";
const API_URL = import.meta.env.VITE_API_URL;

export default function HeroNav({ 
  section,
  setSection,
  selectedCategory,
  setSelectedCategory
}) {
  // 1. Add state to hold your database categories
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 2. Fetch the categories from your backend when the component loads
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Replace this URL with your actual backend endpoint route
        const res = await fetch(`${API_URL}/api/categories`);
        if (!res.ok) throw new Error("Failed to fetch");
        
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array means this runs once on mount

  // 3. Filter the fetched categories by the currently selected top-level section
  const displayedCategories = categories.filter(
    (item) => item.section === section
  );

  return (
    <div className="w-full mt-5 flex flex-col items-center gap-8">
      
      {/* Top Navigation */}
      <div className="flex bg-white rounded-full shadow-lg overflow-hidden">
        {Object.entries(heroNav).map(([key, value]) => (
          <button
            key={key}
            onClick={() => {
              setSection(key);
              setSelectedCategory("All");
            }}
            aria-current={section === key ? "true" : undefined}
            className={`px-10 py-3 font-semibold transition duration-300 cursor-pointer ${
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
        {isLoading ? (
          <p className="text-gray-500">Loading categories...</p>
        ) : (
          displayedCategories.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedCategory(item.name)}
              aria-pressed={selectedCategory === item.name}
              className={`px-6 py-2 rounded-full border transition duration-300 cursor-pointer ${
                selectedCategory === item.name
                  ? "bg-green-900 text-white border-black"
                  : "bg-white text-gray-700 border-gray-300 hover:border-amber-500 hover:text-amber-500"
              }`}
            >
              {item.name}
            </button>
          ))
        )}
      </div>
      
    </div>
  );
}