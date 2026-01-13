const API = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.PROD ? 
    "https://humorous-amazement-production-7ced.up.railway.app" : 
    "http://localhost:3000");

/**
 * Start Google Drive import
 */
export const importImages = async (folderUrl) => {
  console.log('API URL:', API); // Debug log
  const res = await fetch(`${API}/import/google-drive`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ folderUrl }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('API Error:', res.status, errorText); // Debug log
    throw new Error(errorText || "Failed to start import");
  }

  return res.json();
};

/**
 * Fetch imported images
 */
export const fetchImages = async () => {
  console.log('Fetching images from:', `${API}/images`); // Debug log
  const res = await fetch(`${API}/images`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Fetch images error:', res.status, errorText); // Debug log
    throw new Error("Failed to fetch images");
  }

  return res.json();
};
