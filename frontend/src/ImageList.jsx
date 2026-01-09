
import { useEffect, useState } from "react";
import { fetchImages } from "./api";

export default function ImageList() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetchImages().then(setImages).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Imported Images</h2>
      {images.length === 0 && <p>No images imported yet.</p>}
      <ul>
        {images.map((img) => (
          <li key={img.id}>
            <a href={img.storage_path} target="_blank" rel="noreferrer">
              {img.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
