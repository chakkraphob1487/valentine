const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = 3000;

// Data file path
const DATA_FILE = path.join(__dirname, "data.json");

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public", "images"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    cb(null, allowed.includes(file.mimetype));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Helper: read/write data
function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch (err) {
    return { messages: {}, images: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ===== Pages =====
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// ===== API: Get all data =====
app.get("/api/data", (req, res) => {
  const data = readData();
  res.json(data);
});

// ===== API: Update messages =====
app.put("/api/messages", (req, res) => {
  const data = readData();
  data.messages = req.body;
  writeData(data);
  res.json({ success: true, messages: data.messages });
});

// ===== API: Get images =====
app.get("/api/images", (req, res) => {
  const data = readData();
  res.json(data.images);
});

// ===== API: Upload image =====
app.post("/api/images", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image uploaded" });
  }
  const data = readData();
  const newId =
    data.images.length > 0 ? Math.max(...data.images.map((i) => i.id)) + 1 : 1;
  const newImage = {
    id: newId,
    filename: req.file.filename,
    alt: req.body.alt || "Valentine Image",
  };
  data.images.push(newImage);
  writeData(data);
  res.json({ success: true, image: newImage });
});

// ===== API: Delete image =====
app.delete("/api/images/:id", (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const image = data.images.find((i) => i.id === id);

  if (!image) {
    return res.status(404).json({ error: "Image not found" });
  }

  // Delete file from disk
  const filePath = path.join(__dirname, "public", "images", image.filename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.log("Could not delete file:", err.message);
  }

  data.images = data.images.filter((i) => i.id !== id);
  writeData(data);
  res.json({ success: true });
});

// Start server (local dev only, Vercel uses module.exports)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(
      `🌹 Valentine's Day Website running at http://localhost:${PORT}`,
    );
    console.log(`⚙️  Admin panel: http://localhost:${PORT}/admin`);
    console.log(`💖 Press Ctrl+C to stop the server`);
  });
}

// Export for Vercel
module.exports = app;
