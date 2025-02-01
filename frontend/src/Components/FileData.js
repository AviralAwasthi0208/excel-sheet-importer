"use client"; // Enables client-side rendering for the component

import React, { useState, useEffect } from "react";
import {
  Sheet,
  ArrowLeft,
  FileSpreadsheet,
  FileCheck2,
  FileX2,
} from "lucide-react";
import FileDisplay from "../Components/FileDisplay"; // Component for displaying sheet data

export default function FileData({ data, sheetData }) {
  // States to manage the sheets list, loading, errors, and selected sheet data
  const [sheets, setSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSheetData, setSelectedSheetData] = useState(null);

  // useEffect to process the incoming data and set the sheets list
  useEffect(() => {
    if (data) {
      try {
        const sheetList = data.sheets; // Extracts sheet list from the data prop
        setSheets(sheetList); // Sets the sheets list
        setIsLoading(false); // Sets loading to false
      } catch (err) {
        setError("Error processing sheet data."); // Handles errors if any
        setIsLoading(false);
      }
    }
  }, [data]);

  // Handles when a sheet is clicked and sets it as the selected sheet
  const handleSheetClick = (sheetData) => {
    setSelectedSheetData(sheetData); // Updates selectedSheetData to show its details
  };

  // Handles back button click to return to the sheets list
  const handleBackClick = () => {
    setSelectedSheetData(null); // Resets selectedSheetData to show the sheets list
  };

  // If a sheet is selected, render its data using the FileDisplay component
  if (selectedSheetData) {
    return (
      <div className="w-full mx-auto p-4">
        {/* Back button */}
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-md mb-4 hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft size={20} /> Back to Sheets List
        </button>
        {/* Displays the selected sheet data */}
        <FileDisplay data={selectedSheetData} />
      </div>
    );
  }

  // Render the main UI when no sheet is selected
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header section */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <FileSpreadsheet className="text-blue-500" size={32} />
          Excel Sheet Information
        </h2>

        {/* Loading state */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="h-20 bg-gray-200 rounded-lg animate-pulse"
              ></div> // Placeholder for loading state
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="flex items-center gap-3 text-red-500">
            <FileX2 size={24} />
            <p>{error}</p>
          </div>
        ) : sheets && sheets.length > 0 ? (
          // Sheets list if data is available
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {sheets.map((sheet, index) => (
              <button
                key={index}
                onClick={() => handleSheetClick(sheet)} // Handles sheet selection
                className="bg-gray-100 hover:bg-blue-50 p-4 rounded-lg flex items-center justify-between transition-colors group"
              >
                {/* Sheet details */}
                <div className="flex items-center gap-3">
                  <FileCheck2
                    className="text-blue-500 group-hover:text-blue-600"
                    size={24}
                  />
                  <span className="font-medium text-gray-800 group-hover:text-blue-600">
                    {sheet.sheetName}
                  </span>
                </div>
                <Sheet
                  className="text-gray-400 group-hover:text-blue-500"
                  size={20}
                />
              </button>
            ))}
          </div>
        ) : (
          // No sheets available state
          <div className="flex items-center gap-3 text-gray-500">
            <FileX2 size={24} />
            <p>No sheets available to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}
