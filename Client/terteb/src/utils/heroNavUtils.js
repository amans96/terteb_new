import { heroNav } from "../data/heroNav";

export const getCategories = (section) => {
  return heroNav[section]?.categories || [];
};

export const getSections = () => {
  return Object.keys(heroNav);
};