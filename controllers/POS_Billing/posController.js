import mongoose from 'mongoose';
import POSOrder from '../../models/POS/POSOrder.js';
import DineInTable from '../../models/POS/DineInTable.js';
import HoldBill from '../../models/POS/HoldBill.js';
import Discount from '../../models/POS/Discount.js';
import PaymentMethod from '../../models/POS/PaymentMethod.js';
import OrderNote from '../../models/POS/OrderNote.js';
import MenuItem from '../../models/menuItemModel.js';

// Generate order number
const generateOrderNumber = async (restaurantId, prefix = 'ORD') => {
  const count = await POSOrder.countDocuments({ restaurant: restaurantId });
  return `${prefix}${String(count + 1).padStart(6, '0')}`;
};

// Create POS Order
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      orderType,
      customerName,
      customerPhone,
      tableNumber,
      deliveryAddress,
      items,
      subtotal,
      tax,
      discount,
      deliveryFee,
      totalAmount,
      paymentMethod,
      notes,
      estimatedTime
    } = req.body;

    const restaurantId = req.user.restaurant;
    const orderNumber = await generateOrderNumber(restaurantId, orderType === 'dine-in' ? 'DIN' : orderType === 'takeaway' ? 'TAK' : 'DEL');

    // Create order
    const order = await POSOrder.create([{
      restaurant: restaurantId,
      orderNumber,
      orderType,
      customerName,
      customerPhone,
      tableNumber,
      deliveryAddress,
      items,
      subtotal,
      tax,
      discount,
      deliveryFee,
      totalAmount,
      paymentMethod,
      notes,
      estimatedTime,
      createdBy: req.user._id
    }], { session });

    // Update table status if dine-in
    if (orderType === 'dine-in' && tableNumber) {
      await DineInTable.findOneAndUpdate(
        { restaurant: restaurantId, tableNumber },
        { 
          status: 'occupied',
          currentOrder: order[0]._id,
          updatedBy: req.user._id
        },
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all orders
export const getAllOrders = async (req, res) => {
  try {
    const { 
      status, 
      orderType, 
      page = 1, 
      limit = 20, 
      startDate, 
      endDate 
    } = req.query;

    const restaurantId = req.user.restaurant;
    const query = { restaurant: restaurantId };

    if (status) query.status = status;
    if (orderType) query.orderType = orderType;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const orders = await POSOrder.find(query)
      .populate('items.menuItem', 'name price')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await POSOrder.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await POSOrder.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant
    })
    .populate('items.menuItem', 'name price description')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name')
    .populate('orderNotes');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const restaurantId = req.user.restaurant;

    const order = await POSOrder.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId },
      { 
        status,
        updatedBy: req.user._id,
        ...(status === 'completed' && { completedAt: new Date() }),
        ...(status === 'cancelled' && { 
          cancelledAt: new Date(),
          cancelledReason: req.body.cancelledReason 
        })
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Update table status if order is completed or cancelled
    if (order.orderType === 'dine-in' && order.tableNumber) {
      await DineInTable.findOneAndUpdate(
        { restaurant: restaurantId, tableNumber: order.tableNumber },
        { 
          status: 'available',
          currentOrder: null,
          updatedBy: req.user._id
        }
      );
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Hold Bill
export const holdBill = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      tableNumber,
      orderType,
      items,
      subtotal,
      tax,
      discount,
      totalAmount,
      notes
    } = req.body;

    const restaurantId = req.user.restaurant;
    const billNumber = await generateOrderNumber(restaurantId, 'HLD');

    const holdBill = await HoldBill.create({
      restaurant: restaurantId,
      billNumber,
      customerName,
      customerPhone,
      tableNumber,
      orderType,
      items,
      subtotal,
      tax,
      discount,
      totalAmount,
      notes,
      heldBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Bill held successfully',
      data: holdBill
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all hold bills
export const getHoldBills = async (req, res) => {
  try {
    const holdBills = await HoldBill.find({
      restaurant: req.user.restaurant,
      isResumed: false,
      expiresAt: { $gt: new Date() }
    })
    .populate('heldBy', 'name')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: holdBills
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Resume hold bill
export const resumeHoldBill = async (req, res) => {
  try {
    const holdBill = await HoldBill.findOneAndUpdate(
      { 
        _id: req.params.id,
        restaurant: req.user.restaurant,
        isResumed: false
      },
      {
        isResumed: true,
        resumedBy: req.user._id,
        resumedAt: new Date()
      },
      { new: true }
    );

    if (!holdBill) {
      return res.status(404).json({
        success: false,
        message: 'Hold bill not found or already resumed'
      });
    }

    res.json({
      success: true,
      message: 'Bill resumed successfully',
      data: holdBill
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete hold bill
export const deleteHoldBill = async (req, res) => {
  try {
    const holdBill = await HoldBill.findOneAndDelete({
      _id: req.params.id,
      restaurant: req.user.restaurant
    });

    if (!holdBill) {
      return res.status(404).json({
        success: false,
        message: 'Hold bill not found'
      });
    }

    res.json({
      success: true,
      message: 'Hold bill deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get menu items for POS
export const getMenuItems = async (req, res) => {
  try {
    const { category } = req.query;
    const restaurantId = req.user.restaurant;

    const query = { 
      restaurant: restaurantId,
      isActive: true,
      isAvailable: true
    };

    if (category) query.category = category;

    const menuItems = await MenuItem.find(query)
      .populate('category', 'name')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: menuItems
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
