import Discount from '../../models/POS/Discount.js';

// Get all discounts
export const getAllDiscounts = async (req, res) => {
  try {
    const { status, type } = req.query;
    const restaurantId = req.user.restaurant;

    const query = { restaurant: restaurantId };

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    if (type) query.type = type;

    const discounts = await Discount.find(query)
      .populate('menuItems', 'name')
      .populate('categories', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: discounts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active discounts
export const getActiveDiscounts = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const discounts = await Discount.findActive(restaurantId)
      .populate('menuItems', 'name')
      .populate('categories', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: discounts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get discount by ID
export const getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant
    })
    .populate('menuItems', 'name')
    .populate('categories', 'name');

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.json({
      success: true,
      data: discount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create discount
export const createDiscount = async (req, res) => {
  try {
    const {
      name,
      type,
      value,
      minAmount,
      maxDiscount,
      applicableTo,
      menuItems,
      categories,
      startDate,
      endDate,
      usageLimit,
      isActive = true
    } = req.body;

    const restaurantId = req.user.restaurant;

    const discount = await Discount.create({
      restaurant: restaurantId,
      name,
      type,
      value,
      minAmount,
      maxDiscount,
      applicableTo,
      menuItems,
      categories,
      startDate,
      endDate,
      usageLimit,
      isActive,
      createdBy: req.user._id
    });

    const populatedDiscount = await Discount.findById(discount._id)
      .populate('menuItems', 'name')
      .populate('categories', 'name');

    res.status(201).json({
      success: true,
      message: 'Discount created successfully',
      data: populatedDiscount
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update discount
export const updateDiscount = async (req, res) => {
  try {
    const {
      name,
      type,
      value,
      minAmount,
      maxDiscount,
      applicableTo,
      menuItems,
      categories,
      startDate,
      endDate,
      usageLimit,
      isActive
    } = req.body;

    const restaurantId = req.user.restaurant;

    const discount = await Discount.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId },
      {
        name,
        type,
        value,
        minAmount,
        maxDiscount,
        applicableTo,
        menuItems,
        categories,
        startDate,
        endDate,
        usageLimit,
        isActive,
        updatedBy: req.user._id
      },
      { new: true }
    )
    .populate('menuItems', 'name')
    .populate('categories', 'name');

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.json({
      success: true,
      message: 'Discount updated successfully',
      data: discount
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete discount
export const deleteDiscount = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const discount = await Discount.findOneAndDelete({
      _id: req.params.id,
      restaurant: restaurantId
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.json({
      success: true,
      message: 'Discount deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle discount status
export const toggleDiscountStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const restaurantId = req.user.restaurant;

    const discount = await Discount.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId },
      { 
        isActive,
        updatedBy: req.user._id
      },
      { new: true }
    );

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    res.json({
      success: true,
      message: `Discount ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: discount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Calculate discount amount
export const calculateDiscount = async (req, res) => {
  try {
    const { discountId, orderAmount, menuItemId } = req.body;

    const discount = await Discount.findById(discountId);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    const isApplicable = await Discount.isApplicable(discountId, orderAmount, menuItemId);

    if (!isApplicable) {
      return res.status(400).json({
        success: false,
        message: 'Discount is not applicable'
      });
    }

    let discountAmount = 0;

    if (discount.type === 'percentage') {
      discountAmount = (orderAmount * discount.value) / 100;
      if (discount.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    } else {
      discountAmount = discount.value;
    }

    res.json({
      success: true,
      data: {
        discountAmount,
        finalAmount: orderAmount - discountAmount,
        discount: {
          name: discount.name,
          type: discount.type,
          value: discount.value
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Apply discount to order
export const applyDiscount = async (req, res) => {
  try {
    const { orderId, discountId } = req.body;
    const restaurantId = req.user.restaurant;

    const discount = await Discount.findById(discountId);

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: 'Discount not found'
      });
    }

    // Check if discount is applicable
    const order = await POSOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const isApplicable = await Discount.isApplicable(discountId, order.subtotal);

    if (!isApplicable) {
      return res.status(400).json({
        success: false,
        message: 'Discount is not applicable'
      });
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'percentage') {
      discountAmount = (order.subtotal * discount.value) / 100;
      if (discount.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, discount.maxDiscount);
      }
    } else {
      discountAmount = discount.value;
    }

    // Update order with discount
    const updatedOrder = await POSOrder.findByIdAndUpdate(
      orderId,
      {
        discount: discountAmount,
        $push: {
          discounts: {
            discount: discountId,
            amount: discountAmount
          }
        },
        totalAmount: order.subtotal + order.tax - discountAmount + (order.deliveryFee || 0)
      },
      { new: true }
    );

    // Update discount usage count
    await Discount.findByIdAndUpdate(discountId, {
      $inc: { usageCount: 1 }
    });

    res.json({
      success: true,
      message: 'Discount applied successfully',
      data: {
        discountAmount,
        newTotal: updatedOrder.totalAmount
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
