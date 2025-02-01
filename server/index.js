// Importing required libraries
import express from "express"; // Importing Express library
import cors from "cors"; // Importing CORS middleware for cross-origin requests
import path from "path"; // Importing path module
import dotenv from "dotenv"; // Importing dotenv to manage environment variables
import fileUpload from "express-fileupload"; // Importing fileupload middleware

// Load environment variables from a .env file into process.env
dotenv.config();

const app = express(); // Initializing the express application
const PORT = process.env.PORT || 5000; // Set the port from environment or default to 5000

// Get __dirname in ES module environment
import { fileURLToPath } from "url";
const __dirname = path.resolve();

// Middleware setup
app.use(express.json()); // Middleware to parse incoming JSON requests
app.use(
  cors({
    origin: "http://localhost:3000", // Specify the frontend URL (adjust if necessary)
  })
);
app.use(
  fileUpload({
    useTempFiles: true, // Enable temporary file storage
    tempFileDir: "/tmp/", // Directory to store temporary files
  })
);

// Import routes for file uploads
import upload from "./routes/sheetupload.js"; // Import your routes using ES module syntax

// Use the routes in the application with the "/api/v1" prefix
app.use("/api/v1", upload);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

// Connect to the database
import dbConnect from "./config/database.js"; // Import the database connection function
dbConnect(); // Call the function to connect to the database

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server started successfully at ${PORT}`); // Log confirmation once the server starts
});

// Default route (homepage) for the blog website
app.get("/", (req, res) => {
  res.send(`<h1> This is homepage of blog website</h1>`); // Send a simple HTML response as homepage content
});
