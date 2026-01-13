import { useState } from "react";
import { importImages } from "./api";

export default function ImportForm({ onImportComplete }) {
  const [folderUrl, setFolderUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [activeImports, setActiveImports] = useState([]);
  const [processedUrls, setProcessedUrls] = useState(new Set());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderUrl) return;

    // Check if URL is already being processed or was recently processed
    if (processedUrls.has(folderUrl)) {
      setMessage("This folder is already being processed or was recently imported.");
      setMessageType("error");
      return;
    }

    const importId = Date.now();
    
    try {
      setLoading(true);
      setMessage("");
      setMessageType("");
      setImportStatus("Starting import...");
      
      // Add to active imports and processed URLs
      setActiveImports(prev => [...prev, { id: importId, url: folderUrl, status: "Starting..." }]);
      setProcessedUrls(prev => new Set([...prev, folderUrl]));
      
      await importImages(folderUrl);
      
      // Update import status
      setActiveImports(prev => prev.map(imp => 
        imp.id === importId ? { ...imp, status: "Processing..." } : imp
      ));
      
      setMessage("Import started successfully. Images are being processed in the background.");
      setMessageType("success");
      setImportStatus("");
      setFolderUrl(""); // Clear the input field
      
      // Remove from active imports after 30 seconds and show completion
      setTimeout(() => {
        setActiveImports(prev => prev.filter(imp => imp.id !== importId));
        // Remove from processed URLs after 5 minutes to allow re-import later
        setTimeout(() => {
          setProcessedUrls(prev => {
            const newSet = new Set(prev);
            newSet.delete(folderUrl);
            return newSet;
          });
        }, 300000); // 5 minutes
        setMessage("✅ Import completed successfully! Images uploaded to cloud storage.");
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 5000);
      }, 30000);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      setMessage("Failed to start import. Please check the URL and try again.");
      setMessageType("error");
      setImportStatus("");
      setActiveImports(prev => prev.filter(imp => imp.id !== importId));
      setProcessedUrls(prev => {
        const newSet = new Set(prev);
        newSet.delete(folderUrl);
        return newSet;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <span>📁</span>
        Import from Google Drive
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="input-wrapper">
            <input
              type="text"
              className="input-field"
              placeholder="https://drive.google.com/drive/folders/..."
              value={folderUrl}
              onChange={(e) => setFolderUrl(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!folderUrl.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Importing...
              </>
            ) : (
              <>
                <span>🚀</span>
                Import Images
              </>
            )}
          </button>
        </div>
        {activeImports.length > 0 && (
          <div className="active-imports">
            <h4>Active Imports:</h4>
            {activeImports.map(imp => (
              <div key={imp.id} className="import-item">
                <span>📁 {imp.url.split('/').pop()}</span>
                <span className="import-item-status">⏳ {imp.status}</span>
              </div>
            ))}
          </div>
        )}
        {importStatus && (
          <div className="import-status">
            <span>⏳</span> {importStatus}
          </div>
        )}
        {message && (
          <div className={`message ${messageType === "success" ? "message-success" : "message-error"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
