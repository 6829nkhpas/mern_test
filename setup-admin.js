const mongoose = require("mongoose");
const User = require("./models/User");
require("dotenv").config();

const setupAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/mern_test",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@example.com" });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@example.com");
      process.exit(0);
    }

    // Create admin user
    const admin = new User({
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
    });

    await admin.save();

    console.log("Admin user created successfully!");
    console.log("Email: admin@example.com");
    console.log("Password: admin123");
    console.log("Please change the password after first login.");
  } catch (error) {
    console.error("Error setting up admin:", error);
  } finally {
    mongoose.connection.close();
  }
};

setupAdmin();
