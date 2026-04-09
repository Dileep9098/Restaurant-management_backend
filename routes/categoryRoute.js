import express from "express";
import {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController.js";
import auth from "../middleware/auth.js";
import checkPermission from "../middleware/checkPermission.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
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
  fileFilter
});

const router = express.Router();

// Routes
router.post("/create-category",auth,upload.single("file"),checkPermission("categories.create"), createCategory);
router.get("/get-all-categories",auth,checkPermission("categories.view"), getAllCategories);
router.get("/get-single-category/:id", getSingleCategory);
router.put("/update-category/:id", auth,upload.single("file"),checkPermission("categories.update"),updateCategory);
router.delete("/delete-category/:id",auth,checkPermission("categories.delete"), deleteCategory);

export default router;





// import express from "express";
// import {
//     createCategory,
//     getAllCategories,
//     getSingleCategory,
//     updateCategory,
//     deleteCategory
// } from "../controllers/categoryController.js";
// import auth from "../middleware/auth.js";
// import checkPermission from "../middleware/checkPermission.js";
// import multer from "multer";
// import path from "path";
// import { fileURLToPath } from 'url';
// import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);



// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let uploadPath= path.join(__dirname, '../uploads/categories');
//     // if (process.env.NODE_ENV === 'development') {
//     //   uploadPath = path.join(__dirname, '../../my-app/public/assets/images/categories');
//     // } else {
//     //   uploadPath = path.join(__dirname, '../uploads/categories'); 
//     // }
//     // Ensure directory exists
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `${Date.now()}-${file.fieldname}${ext}`);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image/")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only image files allowed"), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter
// });



// const router = express.Router();


// // Routes
// router.post("/create-category",auth,upload.single("file"),checkPermission("categories.create"), createCategory);
// router.get("/get-all-categories",auth,checkPermission("categories.view"), getAllCategories);
// router.get("/get-single-category/:id", getSingleCategory);
// router.put("/update-category/:id", auth,upload.single("file"),checkPermission("categories.update"),updateCategory);
// router.delete("/delete-category/:id",auth,checkPermission("categories.delete"), deleteCategory);

// export default router;