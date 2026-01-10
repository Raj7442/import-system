const API =
  import.meta.env.VITE_API_URL || "http://localhost:3000";


export const importImages = (folderUrl) =>
  fetch(`${API}/import/google-drive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folderUrl }),
  });

export const fetchImages = () =>
  fetch(`${API}/images`).then((res) => res.json());
