// Import the mongoose library for MongoDB object modeling
import mongoose from "mongoose";

// Define a schema for the "File" collection in the database
const fileSchema = new mongoose.Schema({
  // Field to store the name of the file
  name: {
    type: String, // Data type: String
    required: true, // Validation: This field is mandatory
  },
  // Field to store an array of associated sheets
  sheets: [
    {
      type: mongoose.Schema.Types.ObjectId, // Each sheet is referenced by its ObjectId
      ref: "Sheet", // Reference to the "Sheet" model in the database
    },
  ],
});

// Create the "File" model using the schema
const File = mongoose.model("File", fileSchema);

// Export the model to be used in other parts of the application
export default File;
