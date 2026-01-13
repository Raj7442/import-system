import ImportForm from "./ImportForm";
import ImageList from "./ImageList";
import { useState } from "react";
import "./App.css";

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleImportComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Image Import System</h1>
        <p>Import images from Google Drive to cloud storage</p>
      </header>
      <ImportForm onImportComplete={handleImportComplete} />
      <ImageList refreshTrigger={refreshTrigger} />
    </div>
  );
}
