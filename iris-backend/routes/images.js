const express = require("express");
const multer = require("multer");
const router = express.Router();
const imageController = require("../controllers/imageController");

// Configure multer for file uploads (memory storage for now)
const upload = multer({ storage: multer.memoryStorage() });

// Routes
router.post("/upload", upload.single("image"), imageController.uploadImage);
router.get("/", imageController.getAllImages);
router.get("/stats", imageController.getStats);
router.get("/:id", imageController.getImage);
router.delete("/:id", imageController.deleteImage);

module.exports = router;
