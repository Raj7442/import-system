import { useEffect, useState } from "react";
import { fetchImages } from "./api";

export default function ImageList() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImages();
    const interval = setInterval(loadImages, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadImages = async () => {
    try {
      const data = await fetchImages();
      setImages(data);
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setLoading(false);
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
        {images.length > 0 && <span style={{ marginLeft: "auto", fontSize: "1rem", fontWeight: "normal", color: "#666" }}>({images.length})</span>}
      </h2>

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
            <div className="stat-item">
              <div className="stat-value">
                {formatFileSize(images.reduce((sum, img) => sum + (img.size || 0), 0))}
              </div>
              <div className="stat-label">Total Size</div>
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
