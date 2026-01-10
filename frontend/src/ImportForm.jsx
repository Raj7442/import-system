<<<<<<< HEAD
=======

>>>>>>> 06d37f68f9d67736815b83a234c72d1cd96eb3e9
import { useState } from "react";
import { importImages } from "./api";

export default function ImportForm() {
  const [folderUrl, setFolderUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
<<<<<<< HEAD
  const [messageType, setMessageType] = useState("");
=======
>>>>>>> 06d37f68f9d67736815b83a234c72d1cd96eb3e9

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderUrl) return;

    try {
      setLoading(true);
      setMessage("");
<<<<<<< HEAD
      setMessageType("");
      await importImages(folderUrl);
      setMessage("Import started successfully. Images are being processed in the background.");
      setMessageType("success");
      setFolderUrl("");
    } catch (err) {
      setMessage("Failed to start import. Please check the URL and try again.");
      setMessageType("error");
=======
      await importImages(folderUrl);
      setMessage("Import started successfully.");
      setFolderUrl("");
    } catch (err) {
      setMessage("Failed to start import.");
>>>>>>> 06d37f68f9d67736815b83a234c72d1cd96eb3e9
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Paste Google Drive folder URL"
        value={folderUrl}
        onChange={(e) => setFolderUrl(e.target.value)}
        style={{ width: "400px", marginRight: "10px" }}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Importing..." : "Import"}
      </button>
      {message && <p>{message}</p>}
    </form>
>>>>>>> 06d37f68f9d67736815b83a234c72d1cd96eb3e9
  );
}
