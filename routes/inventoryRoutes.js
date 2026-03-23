import express from "express";
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/Inventory/rawMaterialCategory.js";
import { createRawMaterial, deleteRawMaterial, getAllRawMaterials, getLowStockMaterials, getRawMaterialById, updateRawMaterial } from "../controllers/Inventory/rawMaterialController.js";
import { createSupplier, deleteSupplier, getAllSuppliers, updateSupplier } from "../controllers/Inventory/supplierController.js";
import { createSupplierItem, getAllSupplierItems, getItemsBySupplier, getSupplierItemById, getSuppliersByRawMaterial, reactivateSupplierItem, updateSupplierItem, deleteSupplierItem } from "../controllers/Inventory/supplierItemController.js";
import { createPurchase, getAllPurchases, getPurchaseById, updatePurchase, deletePurchase, markAsOrdered, receivePurchase, getAllPurchaseReceives, getPurchaseReceiveById } from "../controllers/Inventory/purchaseController.js";
import { createRecipe, getAllRecipes, getRecipeById, updateRecipe, deleteRecipe, deductStockForMenuItem } from "../controllers/Inventory/recipeController.js";
import { getInventorySettings, updateInventorySettings } from "../controllers/Inventory/inventorySettingController.js";
import { createInventoryTransaction, getAllInventoryTransactions, getCurrentStock, addStockAdjustment } from "../controllers/Inventory/inventoryTransactionController.js";
import auth from "../middleware/auth.js";

const router = express.Router();


// Category
router.post("/create-row-material-category",auth, createCategory);
router.get("/get-all-row-material-category",auth, getAllCategories);
router.get("/get-row-material-category/:id",auth, getCategoryById);
router.put("/update-row-material-category/:id",auth, updateCategory);
router.delete("/delete-row-material-category/:id",auth, deleteCategory);

//Row Material
router.post("/create-row-material",auth, createRawMaterial);
router.get("/get-all-row-material",auth, getAllRawMaterials);
router.get("/low-stock",auth, getLowStockMaterials);
router.get("/get-row-material/:id",auth, getRawMaterialById);
router.put("/update-row-material/:id",auth, updateRawMaterial);
router.delete("/delete-row-material/:id",auth, deleteRawMaterial);


//Supplier Routes
router.post("/create-supplier", auth, createSupplier);
router.get("/get-all-supplier", auth, getAllSuppliers);
router.put("/update-supplier/:id", auth, updateSupplier);
router.delete("/delete-supplier:id", auth, deleteSupplier);


//Supplier Items Routes
router.post("/create-supplier-item", auth, createSupplierItem);
router.get("/get-supplier-item/:id", auth, getSupplierItemById);
router.get("/get-supplier-item-by-supplier/:id", auth, getItemsBySupplier);
router.get("/get-all-supplier-items", auth, getAllSupplierItems);
router.put("/update-supplier-item/:id", auth, updateSupplierItem);
router.delete("/delete-supplier-item/:id", auth, deleteSupplierItem);
router.put("/update-supplier-item-status/:id", auth, reactivateSupplierItem);
router.put("/get-supplier-by-row-material/:id", auth, getSuppliersByRawMaterial);



//purchases Routes
router.post("/create-purchases", auth, createPurchase);
router.get("/get-all-purchases", auth, getAllPurchases);
router.get("/get-single-purchases/:id", auth, getPurchaseById);
router.put("/update-purchase/:id", auth, updatePurchase);
router.delete("/delete-purchase/:id", auth, deletePurchase);


router.patch("/ordered/:id", auth, markAsOrdered);
router.patch("/receive/:id", auth, receivePurchase);

// purchase receive records
router.get("/get-all-purchase-receives", auth, getAllPurchaseReceives);
router.get("/get-purchase-receive/:id", auth, getPurchaseReceiveById);



//Recipe Routes
router.post("/create-recipe", auth, createRecipe);
router.get("/recipes", auth, getAllRecipes);
router.get("/recipes/:id", auth, getRecipeById);
router.put("/recipes/:id", auth, updateRecipe);
router.delete("/recipes/:id", auth, deleteRecipe);
router.get("/deduct-stock-for-menu-item", auth, deductStockForMenuItem);


//Get Inventory Setting
router.post("/get-inventory-setting", auth, getInventorySettings);
router.get("/update-inventory-setting/:id", auth, updateInventorySettings);


//Get Inventory Transaction
router.post("/create-inventory-transaction", auth, createInventoryTransaction);
router.get("/get-all-inventory-transactions", auth, getAllInventoryTransactions);
router.post("/get-current-stock", auth, getCurrentStock);


// support get by id as well (named rawMaterialId for clarity)
router.get("/get-current-stock/:id", auth, getCurrentStock);
router.post("/add-stock-adjustment", auth, addStockAdjustment);

export default router;


