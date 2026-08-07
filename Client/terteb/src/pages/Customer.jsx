import { useState } from "react";
import Hero from "../comp/Hero.jsx";
import Heron from "../comp/Heron.jsx";
import MenuGrid from "../comp/MenuGrid.jsx";

export default function Customer() {
  const [section, setSection] = useState("food");
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <>
      <Hero />

      <Heron
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