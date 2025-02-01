import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Trash2,
  Save,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ExcelTable({ data }) {
  const [sheetData, setSheetData] = useState([]);
  const [modifiedData, setModifiedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const itemsPerPage = 10;

  useEffect(() => {
    if (data) {
      try {
        const extractedData = data.data;
        setSheetData(extractedData);
        setModifiedData(extractedData);
        setIsLoading(false);
      } catch (err) {
        toast.error("Error processing sheet data.");
        setIsLoading(false);
      }
    }
  }, [data]);

  const totalPages = Math.ceil(sheetData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sheetData.slice(startIndex, startIndex + itemsPerPage);

  const confirmDelete = (index) => {
    setRowToDelete(startIndex + index);
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (rowToDelete !== null) {
      const updatedData = sheetData.filter((_, i) => i !== rowToDelete);
      setSheetData(updatedData);
      setModifiedData(updatedData);
      setIsDialogOpen(false);
      setRowToDelete(null);
      toast.success("Row deleted successfully");
      if (currentPage > Math.ceil(updatedData.length / itemsPerPage)) {
        setCurrentPage(Math.max(1, Math.ceil(updatedData.length / itemsPerPage)));
      }
    }
  };

  const handleImport = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/v1/excelFileUpdate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sheetName: data.sheetName,
            updatedData: modifiedData,
          }),
        }
      );

      if (response.ok) {
        toast.success("Data successfully updated!");
      } else {
        toast.error("Update failed.");
      }
    } catch (err) {
      console.error("Error importing data:", err);
      toast.error("An error occurred during update");
    }
  };

  const handleExport = () => {
    try {
      // Convert the data to CSV format
      const headers = ["Name", "Amount", "Date", "Verified"];
      const csvContent = [
        headers.join(","),
        ...sheetData.map(row => [
          row.name,
          row.amount,
          new Date(row.date).toLocaleDateString(),
          row.verified
        ].join(","))
      ].join("\n");

      // Create a Blob containing the CSV data
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      
      // Create a download link and trigger it
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${data.sheetName}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("File exported successfully!");
    } catch (err) {
      console.error("Error exporting data:", err);
      toast.error("Error exporting file");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!sheetData.length) return <div className="text-center py-4">No data available</div>;

  return (
    <>
      <div className="w-full mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-xl font-bold">{data.sheetName} Data</h2>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                <Download size={20} /> Export
              </button>
              <button
                onClick={handleImport}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                <Save size={20} /> Save Changes
              </button>
            </div>
          </div>

          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {["Name", "Amount", "Date", "Verified", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="p-3 text-left text-sm font-semibold"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {currentData.map((entry, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">{entry.name}</td>
                  <td className="p-3">{entry.amount}</td>
                  <td className="p-3">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="p-3">{entry.verified ? "Yes" : "No"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => confirmDelete(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center p-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="p-2 disabled:opacity-50"
              >
                <ChevronsLeft size={20} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 disabled:opacity-50"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 disabled:opacity-50"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 disabled:opacity-50"
              >
                <ChevronsRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
              <p className="mb-4">Are you sure you want to delete this row?</p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}