import express from "express";
import auth from "../middleware/auth.js";
import checkPermission from "../middleware/checkPermission.js";
import { createPermission, getAllPermissions, updatePermission, deletePermission, getAllAssignPermission } from "../controllers/permissioncontroller.js";
import { getSidebar } from "../controllers/sidebar.controller.js";


const router = express.Router();

// Create permission module
router.post("/create-permission", auth, createPermission);
router.get("/get-all-permission", auth, getAllPermissions);
router.put("/update-permission/:id", auth, updatePermission);
router.delete("/delete-permission/:id", auth,  deletePermission);
router.get("/sidebar", auth, getSidebar);

router.get("/get-all-permission-assign",auth,getAllAssignPermission)


export default router;
