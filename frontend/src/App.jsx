import FileUpload from "./Components/FIleUpload";
import { FileSpreadsheet } from "lucide-react"

const App = () => {
  return (
    <div className="container mx-auto p-4">
      <header className="flex items-center justify-center mb-8">
        <FileSpreadsheet className="w-8 h-8 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Excel Data Importer</h1>
      </header>
      <FileUpload />
     
    </div>
  );
};

export default App;
