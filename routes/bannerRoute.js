// import express from "express";
// import multer from "multer";
// import { createBanner, deleteBanner, getAllBanners, getBannerById, updateBanner } from "../controllers/bannerController.js";
// import { isAuthenticateUser } from "../utils/auth.js";

// const router = express.Router();

// // Multer config
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "../uploads/banners/");
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//         cb(null, uniqueSuffix + "-" + file.originalname);
//     },
// });

// const upload = multer({ storage });

// // Routes
// router.post("/admin/add-banner", upload.single("file"),isAuthenticateUser, createBanner);
// router.get("/admin-get-all-banners", isAuthenticateUser,getAllBanners);
// router.get("/admin-single-banner/:id",isAuthenticateUser, getBannerById);
// router.put("/admin-update-banner/:id", upload.single("file"),isAuthenticateUser, updateBanner);
// router.delete("/admin-delete-banner/:id",isAuthenticateUser, deleteBanner);

// export default router;


import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  createBanner,
  deleteBanner,
  getAllBanners,
  getBannerById,
  updateBanner,
} from "../controllers/bannerController.js";

// import { isAuthenticateUser } from "../utils/auth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/banners');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

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
router.post("/add-banner", upload.single("file"), createBanner);
router.get("/get-all-banners", getAllBanners);
router.get("/single-banner/:id", getBannerById);
router.put("/update-banner/:id", upload.single("file"), updateBanner);
router.delete("/delete-banner/:id", deleteBanner);

export default router;
