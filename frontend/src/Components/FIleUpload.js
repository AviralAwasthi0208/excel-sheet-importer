"use client"

import { useState, useRef } from "react"
import { Upload, X } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"
import FileData from "../Components/FileData"

const API_URL = process.env.MODE ==="development" ? "http://localhost:4000/api/v1/excelFileUpload"  : " /api/v1/excelFileUpload"

// Helper function to parse error strings from the server
function parseErrorString(errorString) {
  const regex = /Sheet Name:\s*'(.+?)'\s*,\s*row:\s*(\d+)\s*,\s*Description:(.+)/;
  const match = errorString.match(regex);
  
  if (match) {
    return {
      sheetName: match[1].trim(),
      row: parseInt(match[2], 10),
      description: match[3].trim(),
    };
  }

  return {
    sheetName: "Unknown Sheet",
    row: "Unknown Row",
    description: "No description available",
  };
}

// Function to convert bytes to MB for better display
const bytesToMB = (bytes) => {
  return (bytes / (1024 * 1024)).toFixed(2);
};

// Function to validate if the file size is within the allowed limit
const isValidFileSize = (file) => {
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  return file.size <= maxSize;
};

export default function FileUpload() {
  const [files, setFiles] = useState([])  // State to store the selected files
  const [isDragging, setIsDragging] = useState(false)  // State to track drag events
  const [showFileData, setShowFileData] = useState(false)  // State to toggle showing uploaded file data
  const [uploadResult, setUploadResult] = useState(null)  // State to store the result of the upload
  const [uploadProgress, setUploadProgress] = useState(0)  // State for the upload progress
  const [isUploading, setIsUploading] = useState(false)  // State to check if upload is in progress
  const [errorDetails, setErrorDetails] = useState(null)  // State to store general error message
  const [detailedErrors, setDetailedErrors] = useState(null)  // State to store detailed error information
  const fileInputRef = useRef(null)  // Reference for the file input field

  // Simulate upload progress for visual feedback
  const simulateProgress = () => {
    const progressStages = [0, 50, 75, 100]
    let stageIndex = 0

    const progressInterval = setInterval(() => {
      if (stageIndex < progressStages.length) {
        setUploadProgress(progressStages[stageIndex])
        stageIndex++
      } else {
        clearInterval(progressInterval)
      }
    }, 1000)
  }

  // Function to validate and add files to the state
  const validateAndAddFiles = (newFiles) => {
    const validFiles = [];
    const invalidFiles = [];

    // Check file size and categorize files into valid and invalid
    Array.from(newFiles).forEach(file => {
      if (isValidFileSize(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    });

    // Notify user about invalid files exceeding size limit
    if (invalidFiles.length > 0) {
      const fileNames = invalidFiles.map(f => f.name).join(', ');
      toast.error(`Files exceeding 2MB limit: ${fileNames}`);
    }

    // Add valid files to the files state
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
  };

  // Handlers for drag events to handle file drag-and-drop
  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  // Handle the drop event for drag-and-drop files
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    validateAndAddFiles(e.dataTransfer.files)
  }

  // Handler for file input change
  const handleFileInput = (e) => {
    if (e.target.files) {
      validateAndAddFiles(e.target.files)
    }
  }

  // Remove a file from the files list
  const removeFile = (fileToRemove) => {
    setFiles(files.filter((file) => file !== fileToRemove))
  }

  // Handle the upload process
  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload.");
      return;
    }

    // Double-check file sizes before uploading
    const invalidFiles = files.filter(file => !isValidFileSize(file));
    if (invalidFiles.length > 0) {
      toast.error("Some files exceed the 2MB limit. Please remove them and try again.");
      return;
    }

    // Prepare FormData object for sending files
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });

    setIsUploading(true);
    setUploadProgress(0);  // Reset progress
    simulateProgress();  // Start progress simulation

    try {
      // Make the upload request to the server
      const response = await fetch(`${API_URL}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message || "Upload failed.";
        
        if (errorData.error) {
          const parsedError = parseErrorString(errorData.error);
          setDetailedErrors(parsedError);
        }

        setErrorDetails(errorMessage);  // Set error message
        throw new Error(errorMessage);
      }

      const result = await response.json();
      setUploadResult(result);  // Set the upload result
      toast.success("Files uploaded successfully!");
      setFiles([]);  // Clear the files after upload
      setShowFileData(true);  // Show the uploaded data
      setIsUploading(false);
    } catch (error) {
      console.error("Upload error:", error);
      setErrorDetails(error.message || "File upload failed. Please check the details.");
      setIsUploading(false);
      toast.error("File upload failed.");
    }
  };

  // Close the error dialog box
  const closeErrorDialog = () => {
    setErrorDetails(null)
    setDetailedErrors(null)
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          success: { duration: 3000 },
          error: { duration: 3000 },
        }}
      />
      
      <div className="w-full rounded-lg bg-gray-50 p-4">
        {/* File upload section when not uploading and no file data */}
        {!showFileData && !isUploading && (
          <div
            className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-500"}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
            <p className="mt-2 text-xs sm:text-sm text-gray-600">
              Drag and drop files here, or click to select files
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Maximum file size: 2MB
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="hidden"
              multiple
            />
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </button>
          </div>
        )}

        {/* File preview section before upload */}
        {files.length > 0 && !showFileData && !isUploading && (
          <div className="w-full mt-4 bg-white rounded-lg shadow-md p-4">
            <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-800">
              Selected Files:
            </h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center text-sm text-gray-600 bg-gray-100 p-2 rounded"
                >
                  <span>
                    {file.name} ({bytesToMB(file.size)} MB)
                  </span>
                  <button
                    onClick={() => removeFile(file)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                </li>
              ))}
            </ul>
            <button
              className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={handleUpload}
            >
              Upload Files
            </button>
          </div>
        )}

        {/* Upload progress display */}
        {isUploading && (
          <div className="w-full bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Uploading: {uploadProgress}%</p>
          </div>
        )}

        {/* Display uploaded file data */}
        {showFileData && <FileData data={uploadResult} />}

        {/* Error dialog */}
        {errorDetails && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-md p-6 w-11/12 sm:w-96">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Upload Error</h3>
              <p className="text-sm text-gray-600 mb-4">{errorDetails}</p>
              {detailedErrors && (
                <div className="text-sm text-gray-600 mb-4">
                  <p><strong>Sheet Name:</strong> {detailedErrors.sheetName}</p>
                  <p><strong>Row Number:</strong> {detailedErrors.row}</p>
                  <p><strong>Issue:</strong> {detailedErrors.description}</p>
                </div>
              )}
              <button
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                onClick={closeErrorDialog}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
