const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const controller = require("../controllers/documentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/upload", authMiddleware, upload.single("file"), controller.uploadDocument);
router.get("/:id", authMiddleware, controller.getSummary);
router.post(
  "/upload-with-instructions",
  authMiddleware,
  upload.single("file"),
  controller.uploadDocumentWithInstructions
);


module.exports = router;
