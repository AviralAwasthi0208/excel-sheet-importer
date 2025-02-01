// Import the mongoose library for MongoDB interaction
import mongoose from "mongoose";

// Load environment variables from the .env file using dotenv
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

// Function to connect to the MongoDB database
const dbConnect = () => {
  // Use mongoose to establish a connection to the database
  mongoose
    .connect(process.env.DATABASE_URL, {})
    .then(() => {
      // Log a success message when the connection is successful
      console.log("DB connection successful");
    })
    .catch((error) => {
      // Log an error message if the connection fails
      console.log("Received an error");
      // Print the specific error message for debugging purposes
      console.error(error.message);
      // Exit the process with a failure code (1) to indicate the error
      process.exit(1);
    });
};

// Export the dbConnect function so it can be used in other files
export default dbConnect;
