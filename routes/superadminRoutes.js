import express from "express";

import { createRestaurant,getAllRestaurants,getRestaurantById,updateRestaurant,toggleRestaurantStatus,deleteRestaurant, createRestaurantUser, getRestaurantUsers, updateRestaurantUser, deleteRestaurantUser, updateRestaurantUserProfile } from "../controllers/restaurentController.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path"
import { fileURLToPath } from "url";
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

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
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});


const router = express.Router();

// Add middleware for parsing form data
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// Add debugging middleware
// router.use((req, res, next) => {
//   console.log("=== DEBUG MIDDLEWARE ===");
//   console.log("Content-Type:", req.get('Content-Type'));
//   console.log("Request headers:", req.headers);
//   console.log("Request body keys:", Object.keys(req.body || {}));
//   console.log("Request files keys:", Object.keys(req.files || {}));
//   console.log("========================");
//   next();
// });

// Add multer error handler
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error("Multer Error:", error);
    return res.status(400).json({
      success: false,
      message: "File upload error: " + error.message
    });
  }
  next(error);
});

router.post("/create-restaurent", upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'qrCode', maxCount: 1 }
]), createRestaurant);
router.get("/get-all-restaurent", auth, getAllRestaurants);
router.get("/restaurent/:id", auth, getRestaurantById);
router.put("/update-restaurent/:id", auth,upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'qrCode', maxCount: 1 }
]), updateRestaurant);
router.patch("/restaurent/status/:id", auth, toggleRestaurantStatus);
router.delete("/delete-restaurent/:id", auth, deleteRestaurant);

router.post("/create-restaurent-admin", auth, createRestaurantUser);
router.get("/get-all-admin-restaurent", auth, getRestaurantUsers);
router.put("/update-restaurent-admin/:id", auth, updateRestaurantUser);
router.delete("/delete-restaurent-admin/:id", auth, deleteRestaurantUser);
router.put("/update-restaurent-admin-profile/:id", auth, updateRestaurantUserProfile);

export default router;
