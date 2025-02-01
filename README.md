# 📊 Excel Data Importer

A powerful React-based web application designed for importing, validating, and managing Excel (.xlsx) files. The app provides an intuitive interface for users to preview, edit, and import data efficiently while handling errors gracefully.

## 🚀 Features

### ✅ **Frontend**
- **Drag-and-Drop File Upload**: Supports `.xlsx` files (max 2MB).
- **Data Preview**: Displays Excel data in a paginated table.
- **Error Handling**: Highlights validation errors per sheet and row.
- **Row Deletion**: Users can delete rows with confirmation prompts.
- **Data Export**: Allows exporting validated data back to `.csv`.
- **Dark Mode Support**: (Optional) Clean and responsive UI with Tailwind CSS.

### 🛠 **Backend**
- **Excel Validation**: Ensures required columns (`Name`, `Amount`, `Date`, `Verified`) exist.
- **Customizable Rules**: Supports different validation rules per sheet.
- **Database Integration**: Stores imported data in MongoDB Atlas.
- **Scalable Processing**: Optimized to handle thousands of rows.

---

## 🏗 Tech Stack

| **Category**  | **Technology** |
|--------------|----------------|
| Frontend | React.js, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Libraries | xlsx (Excel Parsing), Mongoose, React Hot Toast |

---

## 📥 Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/excel-data-importer.git
   cd excel-data-importer
