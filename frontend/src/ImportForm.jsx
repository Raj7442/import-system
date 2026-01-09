import { useState } from "react";
import { importImages } from "./api";

export default function ImportForm() {
  const [folderUrl, setFolderUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderUrl) return;

    try {
      setLoading(true);
      setMessage("");
      setMessageType("");
      await importImages(folderUrl);
      setMessage("Import started successfully. Images are being processed in the background.");
      setMessageType("success");
      setFolderUrl("");
    } catch (err) {
      setMessage("Failed to start import. Please check the URL and try again.");
      setMessageType("error");
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
        {message && (
          <div className={`message ${messageType === "success" ? "message-success" : "message-error"}`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
