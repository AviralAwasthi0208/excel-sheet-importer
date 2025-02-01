// Import required modules and models
import File from "../models/file.js";
import Sheet from "../models/Sheet.js";
import Excel from "exceljs";

// Handler for reading and processing the uploaded Excel file
export const sheetReader = async (req, res) => {
  try {
    // Retrieve the uploaded file
    const file = req.files?.file;

    // Check if a file is uploaded
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file is uploaded",
      });
    }

    // Add file size validation (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File size must be less than 2MB",
      });
    }

    const filePath = file.tempFilePath;
    const fileName = file.name;

    // Initialize an Excel workbook to read the file
    const workbook = new Excel.Workbook();
    await workbook.xlsx.readFile(filePath);

    // Check if the file contains any worksheets
    if (workbook.worksheets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No worksheets found in the file",
      });
    }

    const sheetsData = [];

    // Get current date for comparison (to validate dates)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Loop through each worksheet
    for (const worksheet of workbook.worksheets) {
      const sheetData = [];

      // Process each row starting from the second row
      for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        const values = row.values.slice(1); // Skip first element (index 0)

        // Skip row if it has fewer than 4 values
        if (values.length < 4) continue;

        let [name, amount, date, verified] = values;

        // Validate name
        if (!name || typeof name !== "string" || !name.trim()) {
          throw new Error(`Sheet Name: '${worksheet.name}', row: ${rowNumber}, Description: name is missing`);
        }

        // Validate amount
        if (typeof amount !== "number") {
          throw new Error(`Sheet Name: '${worksheet.name}', row: ${rowNumber}, Description: amount is missing`);
        }

        // Enhanced date validation
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          throw new Error(`Sheet Name: '${worksheet.name}', row: ${rowNumber}, Description: date is missing`);
        }

        // Check if the date is within the current month and year
        if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) {
          throw new Error(
            `Sheet Name: '${worksheet.name}', row: ${rowNumber}, Description: Invalid date - date must belong to current month (${currentDate.toLocaleString(
              "default",
              { month: "long" }
            )} ${currentYear})`
          );
        }

        // Validate verified status
        if (verified !== "yes" && verified !== "Yes" && verified !== "No") {
          throw new Error(`Sheet Name: '${worksheet.name}', row: ${rowNumber}, Description: verified is missing`);
        }

        // Add the validated row data
        sheetData.push({ name, amount, date, verified });
      }

      // If there is any valid data in the sheet, store it in the database
      if (sheetData.length > 0) {
        const sheetEntry = await Sheet.create({
          sheetName: worksheet.name,
          data: sheetData,
        });

        sheetsData.push({
          sheetId: sheetEntry._id,
          sheetName: worksheet.name,
          data: sheetData,
        });
      }
    }

    // If no valid data was found in any sheet, return an error
    if (sheetsData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid data found in any worksheet",
      });
    }

    // Create a new file entry in the database with associated sheets
    const newFile = await File.create({
      name: fileName,
      sheets: sheetsData.map((sheet) => sheet.sheetId),
    });

    // Respond with success and return the file and sheet data
    return res.status(200).json({
      success: true,
      message: "File and associated sheets uploaded successfully",
      file: newFile,
      sheets: sheetsData,
    });
  } catch (error) {
    // Handle any errors and return a detailed error message
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "Error processing the file",
      error: error.message,
    });
  }
};

// Handler for updating sheet data
export const updateSheet = async (req, res) => {
  const { updatedData, sheetName } = req.body;

  // Validate that updatedData is an array
  if (!updatedData || !Array.isArray(updatedData)) {
    return res.status(400).json({
      success: false,
      message: "Invalid data format",
    });
  }

  // Validate that sheetName is provided
  if (!sheetName) {
    return res.status(400).json({
      success: false,
      message: "Sheet name is required",
    });
  }

  try {
    // Get current date for validation
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Validate that dates in the updated data belong to the current month and year
    for (let i = 0; i < updatedData.length; i++) {
      const row = updatedData[i];
      const rowDate = new Date(row.date);

      // If the date doesn't match the current month and year, return an error
      if (rowDate.getMonth() !== currentMonth || rowDate.getFullYear() !== currentYear) {
        return res.status(400).json({
          success: false,
          message: `Invalid date in row ${i + 1} - date must belong to current month (${currentDate.toLocaleString(
            "default",
            { month: "long" }
          )} ${currentYear})`,
        });
      }
    }

    // Find the sheet by its name
    const sheet = await Sheet.findOne({ sheetName });

    // If the sheet doesn't exist, return an error
    if (!sheet) {
      return res.status(404).json({
        success: false,
        message: "Sheet not found",
      });
    }

    // Update the sheet data with the new data
    sheet.data = updatedData;
    await sheet.save();

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Sheet data updated successfully!",
    });
  } catch (error) {
    // Log and handle any errors during the update
    console.error("Error updating sheet data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [
        {
          error: error.message,
        },
      ],
    });
  }
};
