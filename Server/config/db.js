import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Database connection failed");
    console.error("Error:", error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error("\n🔍 This is a DNS/Network issue. Try:");
      console.error("1. Flush DNS cache");
      console.error("2. Change DNS to 8.8.8.8");
      console.error("3. Use mobile hotspot");
      console.error("4. Use VPN");
    }
    process.exit(1);
  }
};

export default connectDB;