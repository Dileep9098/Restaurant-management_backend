

import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';
import auth from "../middleware/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  createBanner,
  deleteBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
} from "../controllers/bannerController.js";
import checkPermission from "../middleware/checkPermission.js";

// import { isAuthenticateUser } from "../utils/auth.js";

const router = express.Router();

// Memory storage for direct Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter
});

// Routes
router.post("/add-banner",auth, upload.single("file"), createBanner);
router.get("/get-all-banners", getAllBanners);
router.get("/single-banner/:id", auth, getBannerById);
router.put("/update-banner/:id", auth, upload.single("file"), updateBanner);
router.delete("/delete-banner/:id", auth, deleteBanner);

export default router;
