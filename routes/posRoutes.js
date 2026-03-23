import express from 'express';

const router = express.Router();

// Import all POS controllers using ES6 imports
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  holdBill,
  getHoldBills,
  resumeHoldBill,
  deleteHoldBill,
  getMenuItems
} from '../controllers/POS_Billing/posController.js';

import {
  getAllTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
  reserveTable,
  cancelReservation
} from '../controllers/POS_Billing/dineInController.js';

import {
  getAllDiscounts,
  getActiveDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus,
  calculateDiscount,
  applyDiscount
} from '../controllers/POS_Billing/discountController.js';

import {
  getAllPaymentMethods,
  getActivePaymentMethods,
  getPaymentMethodById,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentStatus,
  setDefaultPaymentMethod,
  calculateTransactionFee,
  validatePaymentMethod
} from '../controllers/POS_Billing/paymentController.js';
import auth from '../middleware/auth.js';

// ===== POS ORDERS ROUTES =====
router.post('/orders', auth, createOrder);
router.get('/orders', auth, getAllOrders);
router.get('/orders/:id', auth, getOrderById);
router.patch('/orders/:id/status', auth, updateOrderStatus);
router.get('/menu-items', auth, getMenuItems);

// ===== HOLD BILLS ROUTES =====
router.post('/hold-bills', auth, holdBill);
router.get('/hold-bills', auth, getHoldBills);
router.post('/hold-bills/:id/resume', auth, resumeHoldBill);
router.delete('/hold-bills/:id', auth, deleteHoldBill);

// ===== DINE-IN TABLES ROUTES =====
router.get('/dine-in-tables', auth, getAllTables);
router.get('/dine-in-tables/:id', auth, getTableById);
router.post('/dine-in-tables', auth, createTable);
router.put('/dine-in-tables/:id', auth, updateTable);
router.patch('/dine-in-tables/:id/status', auth, updateTableStatus);
router.delete('/dine-in-tables/:id', auth, deleteTable);
router.post('/dine-in-tables/:id/reserve', auth, reserveTable);
router.post('/dine-in-tables/:id/cancel-reservation', auth, cancelReservation);

// ===== DISCOUNTS ROUTES =====
router.get('/discounts', auth, getAllDiscounts);
router.get('/discounts/active', auth, getActiveDiscounts);
router.get('/discounts/:id', auth, getDiscountById);
router.post('/discounts', auth, createDiscount);
router.put('/discounts/:id', auth, updateDiscount);
router.delete('/discounts/:id', auth, deleteDiscount);
router.patch('/discounts/:id/toggle', auth, toggleDiscountStatus);
router.post('/discounts/calculate', auth, calculateDiscount);
router.post('/discounts/apply', auth, applyDiscount);

// ===== PAYMENT METHODS ROUTES =====
router.get('/payment-methods', auth, getAllPaymentMethods);
router.get('/payment-methods/active', auth, getActivePaymentMethods);
router.get('/payment-methods/:id', auth, getPaymentMethodById);
router.post('/payment-methods', auth, createPaymentMethod);
router.put('/payment-methods/:id', auth, updatePaymentMethod);
router.delete('/payment-methods/:id', auth, deletePaymentMethod);
router.patch('/payment-methods/:id/toggle', auth, togglePaymentStatus);
router.patch('/payment-methods/:id/set-default', auth, setDefaultPaymentMethod);
router.post('/payment-methods/calculate-fee', auth, calculateTransactionFee);
router.post('/payment-methods/validate', auth, validatePaymentMethod);

export default router;
