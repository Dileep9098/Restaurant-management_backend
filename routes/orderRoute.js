import express from "express";
import { downloadInvoice, getMyOrder, getOrders, placeOrder, updateOrderStatus, updatePreparationTime, getOrderStatusCounts, updateOrderDetails } from "../controllers/orderController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/place-order", placeOrder);
router.get("/get-all-order", auth, getOrders);
router.get("/get-my-orders", auth, getMyOrder);
router.get("/get-status-counts", auth, getOrderStatusCounts);
router.put("/update-order-stauts/:id", auth, updateOrderStatus);
router.put("/update-order-details/:id", auth, updateOrderDetails);
router.put("/update-preparation-time/:id", auth, updatePreparationTime);
router.get("/download-invoice/:id", downloadInvoice);

export default router;
