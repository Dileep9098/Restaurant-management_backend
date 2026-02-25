
import express from "express";
import checkPermission from "../middleware/checkPermission.js";
import { assignPermissionToRole, createRole, deleteRole, getAllRolePermissions, getPermissionsByRole, getRoles, getSingleRoleAssignPermission, removePermissionFromRole, updateRole, updateRolePermission } from "../controllers/roleController.js";
import auth from "../middleware/auth.js";


const router = express.Router();



// Routes

router.post("/create-role", auth, checkPermission("role.create"), createRole);
router.get("/get-all-roles", auth, getRoles);
router.put("/update-role/:id", auth, checkPermission("role.update"), updateRole);
router.delete("/delete-role/:id", auth, checkPermission("role.delete"), deleteRole);

router.post("/role-assign", assignPermissionToRole);
router.get("/get-all-role-assign",auth, getAllRolePermissions);
router.get("/get-single-role-permission-assign",auth,getSingleRoleAssignPermission);

router.delete("/delete-role-permission/:id", removePermissionFromRole);
router.get("/get-user-role/:roleId", getPermissionsByRole);
router.put("/update-role-permission/:id", updateRolePermission);
export default router;
