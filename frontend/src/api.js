const API = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? 
    "https://humorous-amazement-production-7ced.up.railway.app" : 
    "http://localhost:3000");

/**
 * Start Google Drive import
 */
export const importImages = async (folderUrl) => {
  const res = await fetch(`${API}/import/google-drive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folderUrl }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to start import");
  }

  return res.json();
};

/**
 * Fetch imported images
 */
export const fetchImages = async () => {
  const res = await fetch(`${API}/images`);

  if (!res.ok) {
    throw new Error("Failed to fetch images");
  }

  return res.json();
};
