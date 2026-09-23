import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // process.env.MONGO_URI will be loaded by dotenv in server.js
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If we can't connect to the database, the server shouldn't run.
    process.exit(1); 
  }
};

export default connectDB;