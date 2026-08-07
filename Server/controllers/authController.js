import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";


export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;


    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });


    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });


    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });


  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



export const login = async (req, res) => {

  try {

    const { email, password } = req.body;


    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }


    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );


    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }


    const token = generateToken(user);


    res.json({
      token,

      user:{
        id:user.id,
        name:user.name,
        email:user.email,
        role:user.role
      }

    });


  } catch(error){

    res.status(500).json({
      message:error.message
    });

  }

};