import bcrypt from "bcrypt";
import prisma from "./lib/prisma.js";

const password = await bcrypt.hash("Test1234", 10);

const user = await prisma.user.create({
  data: {
    name: "admin",
    password,
  },
});

console.log("Test user created:", user);
await prisma.$disconnect();