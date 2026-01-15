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
        <div className="header-badge">☁️ Cloud-Powered</div>
        <h1>Distributed Image Import Service</h1>
        <p>Seamlessly import and manage images from Google Drive to cloud storage</p>
      </header>
      <ImportForm onImportComplete={handleImportComplete} />
      <ImageList refreshTrigger={refreshTrigger} />
    </div>
  );
}
