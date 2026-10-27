
import bcrypt from "bcrypt";
import prisma from "./lib/prisma.js";

const password = await bcrypt.hash("Test1234", 10);

try {
  const user = await prisma.user.create({
    data: {
      name: "admin",
      email: "admin@example.com",
      password,
    },
  });

  console.log("Test user created:", user);
} catch (error) {
  console.error("Failed to create test user:", error);
} finally {
  await prisma.$disconnect();
}
