import "dotenv/config";
import Groq from "groq-sdk";

if (!process.env.FREEMODEL_API_KEY
) {
  throw new Error("GROQ_API_KEY is missing from .env");
}

const groq = new Groq({
  apiKey: process.env.FREEMODEL_API_KEY,
});

export const GROQ_MODEL =
  process.env.FREEMODEL_MODEL || "llama-3.3-70b-versatile";

export default groq;