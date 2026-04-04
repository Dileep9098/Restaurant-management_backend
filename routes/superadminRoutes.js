import express from "express";

import { createRestaurant,getAllRestaurants,getRestaurantById,updateRestaurant,toggleRestaurantStatus,deleteRestaurant, createRestaurantUser, getRestaurantUsers, updateRestaurantUser, deleteRestaurantUser } from "../controllers/restaurentController.js";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path"
import { fileURLToPath } from "url";
import fs from 'fs';
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);



const storage = multer.diskStorage({
  // destination: (req, file, cb) => {
    // cb(null, "../my-app/public/assets/images/categories");
    //  path.join(__dirname, '../uploads/categories')
  // },

 destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/categories');
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

// Separate upload for QR code
const qrUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "../my-app/public/assets/images/qrcodes");
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${Date.now()}-qrcode${ext}`);
    }
  }),
  fileFilter
});


const router = express.Router();

router.post("/create-restaurent", auth,upload.fields([
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

export default router;
