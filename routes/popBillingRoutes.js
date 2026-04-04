import express from "express";
import { createInvoiceTemplate, deleteInvoiceTemplate, getAllInvoiceTemplates, setRestaurantTemplate, updateInvoiceTemplate } from "../controllers/invoiceTemplateController";
import auth from "../middleware/auth.js";
import checkPermission from "../middleware/checkPermission";
import multer from "multer";
import path from "path";
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    // destination: (req, file, cb) => {
        // cb(null, "../my-app/public/assets/images/invoiceTemplate");
        //  if (process.env.NODE_ENV === 'development') {
        //     cb(null, "../my-app/public/assets/images/invoiceTemplate");
        // } else {
            
        //     cb(null, "https://restaurant-management-f.vercel.app/assets/images/invoiceTemplate");
        // }
            // cb(null, "../uploads/invoiceTemplate");
    // },
     destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads/invoiceTemplate');
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


const router = express.Router();

router.get("/create-invoice-template", auth, checkPermission("bill_formate.create"),upload.single("file"), createInvoiceTemplate);
router.get("/get-all-invoice-template", auth, checkPermission("bill_formate.view"), getAllInvoiceTemplates);
router.get("/update-invoice-template/:id", auth, checkPermission("bill_formate.update"),upload.single("file"), updateInvoiceTemplate);
router.get("/delete-invoice-template", auth, checkPermission("bill_formate.delete"),deleteInvoiceTemplate);
router.get("/set-restaurant-invoice-template", auth, checkPermission("bill_formate.view"), setRestaurantTemplate);

export default router;
