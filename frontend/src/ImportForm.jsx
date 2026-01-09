
import { useState } from "react";
import { importImages } from "./api";

export default function ImportForm() {
  const [folderUrl, setFolderUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderUrl) return;

    try {
      setLoading(true);
      setMessage("");
      await importImages(folderUrl);
      setMessage("Import started successfully.");
      setFolderUrl("");
    } catch (err) {
      setMessage("Failed to start import.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}
