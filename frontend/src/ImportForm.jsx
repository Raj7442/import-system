import { useState } from "react";
import { importImages } from "./api";

export default function ImportForm({ onImportComplete }) {
  const [folderUrl, setFolderUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [importStatus, setImportStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderUrl) return;

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");
      setImportStatus("Starting import...");
      
      await importImages(folderUrl);
      
      setMessage("Import started successfully. Images are being processed in the background.");
      setMessageType("success");
      setImportStatus("Processing images...");
      setFolderUrl(""); // Clear the input field
      
      // Notify parent component
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (err) {
      setMessage("Failed to start import. Please check the URL and try again.");
      setMessageType("error");
      setImportStatus("");
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
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !folderUrl.trim()}
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
