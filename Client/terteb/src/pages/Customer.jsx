
import { useState } from "react";
import Hero from "../comp/Hero.jsx";
import Heron from "../comp/Heron.jsx";
import MenuGrid from "../comp/MenuGrid.jsx";

export default function Customer() {
  // Current top-level section: FOOD or DRINK
  const [section, setSection] = useState("FOOD");

  // Current category inside that section
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <>
      <Hero />

      {/* 
        HeroNav controls:
        - FOOD / DRINK
        - Category selection
      */}
      <Heron
        section={section}
        setSection={setSection}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/*
        MenuGrid receives the current filters
        and uses them to display the correct menu items.
      */}
      <MenuGrid
        section={section}
        selectedCategory={selectedCategory}
      />
    </>
  );
}

