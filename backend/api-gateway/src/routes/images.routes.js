import express from "express";
import { pool } from "../db.js";

const router = express.Router();

router.get("/", async (_, res) => {
  const result = await pool.query("SELECT * FROM images ORDER BY id DESC");
  res.json(result.rows);
});

router.delete("/", async (_, res) => {
  try {
    await pool.query("DELETE FROM images");
    res.json({ message: "All images cleared successfully" });
  } catch (error) {
    console.error("Error clearing images:", error);
    res.status(500).json({ error: "Failed to clear images" });
  }
});

export default router;

