// Import the mongoose library for MongoDB object modeling
import mongoose from "mongoose";

// Define a schema for the "Sheet" collection in the database
const sheetSchema = new mongoose.Schema({
  // Field to store the name of the sheet
  sheetName: {
    type: String, // Data type: String
    required: true, // Validation: This field is mandatory
  },
  // Field to store an array of data entries for the sheet
  data: [
    {
      // Field for the name of the individual data entry
      name: {
        type: String, // Data type: String
        required: true, // Validation: This field is mandatory
      },
      // Field for the amount in the data entry
      amount: {
        type: Number, // Data type: Number
        required: true, // Validation: This field is mandatory
      },
      // Field for the date in the data entry
      date: {
        type: Date, // Data type: Date
        required: true, // Validation: This field is mandatory
      },
      // Field for whether the data entry is verified or not
      verified: {
        type: String, // Data type: String
        enum: ["Yes", "No", "yes", "no"], // Allowed values for this field
        required: true, // Validation: This field is mandatory
      },
    },
  ],
});

// Create the "Sheet" model using the schema
const Sheet = mongoose.model("Sheet", sheetSchema);

// Export the model to be used in other parts of the application
export default Sheet;
