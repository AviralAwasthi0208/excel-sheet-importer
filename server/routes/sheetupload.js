// Importing the Express module and creating a router instance
import express from "express";
const router = express.Router();

// Importing the sheetReader and updateSheet functions from the controller
import { sheetReader, updateSheet } from "../controllers/SheetRead.js";

// POST route to handle the uploading of an Excel file, triggers the sheetReader function
router.post("/excelFileUpload", sheetReader);

// POST route to handle updating an Excel file, triggers the updateSheet function
router.post("/excelFileUpdate", updateSheet);

// Export the router so it can be used in other parts of the application
export default router;
