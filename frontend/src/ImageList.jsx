import { useEffect, useState } from "react";
import { fetchImages, clearAllImages } from "./api";

export default function ImageList({ refreshTrigger }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastCount, setLastCount] = useState(0);
  const [importComplete, setImportComplete] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    setLastCount(0); // Reset counter on component mount
    loadImages();
    const interval = setInterval(loadImages, 3000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const loadImages = async () => {
    try {
      const data = await fetchImages();
      
      if (data.length > lastCount && lastCount > 0) {
        setImportComplete(true);
        setTimeout(() => setImportComplete(false), 5000);
      }
      
      setImages(data);
      setLastCount(data.length);
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all imported images? This cannot be undone.")) {
      return;
    }

    try {
      setClearing(true);
      await clearAllImages();
      setImages([]);
      setLastCount(0);
    } catch (err) {
      console.error("Failed to clear images:", err);
      alert("Failed to clear images. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <span>🖼️</span>
        Imported Images
        {images.length > 0 && (
          <>
            <span style={{ marginLeft: "auto", fontSize: "1rem", fontWeight: "normal", color: "#666" }}>({images.length})</span>
            <button 
              onClick={handleClearAll}
              disabled={clearing}
              className="btn btn-danger"
              style={{ marginLeft: "10px", fontSize: "0.8rem", padding: "4px 8px" }}
            >
              {clearing ? "Clearing..." : "🗑️ Clear All"}
            </button>
          </>
        )}
      </h2>

      {importComplete && (
        <div className="completion-message">
          ✅ Import completed! {images.length - lastCount} new images added.
        </div>
      )}

      {loading && images.length === 0 ? (
        <div className="empty-state">
          <div className="loading-spinner" style={{ margin: "0 auto", width: "40px", height: "40px", borderWidth: "4px" }}></div>
          <p className="empty-state-text" style={{ marginTop: "20px" }}>Loading images...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <p className="empty-state-text">No images imported yet.</p>
          <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#999" }}>
            Import images from a Google Drive folder to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="stats">
            <div className="stat-item">
              <div className="stat-value">{images.length}</div>
              <div className="stat-label">Total Images</div>
            </div>
          </div>
          <div className="images-grid">
            {images.map((img) => (
              <a
                key={img.id}
                href={img.storage_path}
                target="_blank"
                rel="noreferrer"
                className="image-card"
              >
                <div className="image-preview">
                  {img.storage_path ? (
                    <img
                      src={img.storage_path}
                      alt={img.name}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.textContent = "🖼️";
                      }}
                    />
                  ) : (
                    "🖼️"
                  )}
                </div>
                <div className="image-info">
                  <div className="image-name" title={img.name}>
                    {img.name}
                  </div>
                  <div className="image-meta">
                    <span>{formatFileSize(img.size)}</span>
                    {img.mime_type && <span>{img.mime_type}</span>}
                    {img.created_at && <span>{formatDate(img.created_at)}</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
