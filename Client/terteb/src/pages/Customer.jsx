import { useState } from "react";
import Hero from "../comp/Hero.jsx";
import HeroNav from "../comp/HeroNav.jsx";
import MenuGrid from "../comp/MenuGrid.jsx";

export default function Customer() {
  const [section, setSection] = useState("food");
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <>
      <Hero />

      <HeroNav
        section={section}
        setSection={setSection}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <MenuGrid
        section={section}
        selectedCategory={selectedCategory}
      />
    </>
  );
}