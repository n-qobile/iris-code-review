const express = require("express");
const router = express.Router();
const analysisController = require("../controllers/analysisController");

// Routes
router.post("/:id/analyze", analysisController.analyzeImage);
router.get("/:id", analysisController.getAnalysis);

module.exports = router;
