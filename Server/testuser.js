import prisma from "./lib/prisma.js";

async function test() {
  try {
    const users = await prisma.user.findMany();

    console.log("Users table works ✅");
    console.log(users);

  } catch (error) {
    console.log("User table does NOT exist ❌");
    console.log(error.message);

  } finally {
    await prisma.$disconnect();
  }
}

test();