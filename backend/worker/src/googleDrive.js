import axios from "axios";

export async function fetchImages(folderId) {
  const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${process.env.GDRIVE_API_KEY}`;
  const res = await axios.get(url);
  return res.data.files;
}

