// import express from "express";
// import auth from "../middleware/auth.js";
// import checkPermission from "../middleware/checkPermission.js";
// import { createMenuItem, deleteMenuItem, getMenuItems, updateMenuItem } from "../controllers/menuItemController.js";

// import multer from "multer";
// import path from "path";



// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, "../my-app/public/assets/images/categories");
//     },
//     filename: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         cb(null, `${Date.now()}-${file.fieldname}${ext}`);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//         cb(null, true);
//     } else {
//         cb(new Error("Only image files allowed"), false);
//     }
// };

// const upload = multer({
//     storage,
//     fileFilter
// });



// const router = express.Router();

// // Create permission module
// router.post("/create-menu-item", auth, checkPermission("items.create"), createMenuItem);
// router.get("/get-all-menu-items", auth, checkPermission("items.view"), getMenuItems);
// router.put("/update-menu-item/:id", auth, checkPermission("items.update"), updateMenuItem);
// router.delete("/delete-menu-item/:id", auth, checkPermission("items.delete"), deleteMenuItem);



// export default router;





import express from "express";
import auth from "../middleware/auth.js";
import checkPermission from "../middleware/checkPermission.js";
import {
    createMenuItem,
    deleteMenuItem,
    getMenuItems,
    updateMenuItem
} from "../controllers/menuItemController.js";

import multer from "multer";
import path from "path";

const router = express.Router();

/* =======================
   MULTER CONFIG
======================= */

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (process.env.NODE_ENV === 'development') {
            cb(null, "../my-app/public/assets/images/menu");
        } else {
            
            cb(null, "https://restaurant-management-f.vercel.app/assets/images/menu");
        }
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
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
    fileFilter,
});

/* =======================
   ROUTES
======================= */

router.post(
    "/create-menu-item",
    auth,
    checkPermission("items.create"),
    upload.array("image", 5),
    createMenuItem
);

router.get(
    "/get-all-menu-items",
    auth,
    checkPermission("items.view"),
    getMenuItems
);

router.put(
    "/update-menu-item/:id",
    auth,
    checkPermission("items.update"),
    upload.array("image", 5),
    updateMenuItem
);

router.delete(
    "/delete-menu-item/:id",
    auth,
    checkPermission("items.delete"),
    deleteMenuItem
);

export default router;
