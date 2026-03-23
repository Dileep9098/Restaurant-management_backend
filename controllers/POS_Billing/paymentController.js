import POSPaymentMethod from '../../models/POS/PaymentMethod.js';

// Get all payment methods
export const getAllPaymentMethods = async (req, res) => {
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

    const paymentMethods = await POSPaymentMethod.find(query)
      .sort({ isDefault: -1, name: 1 });

    res.json({
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get active payment methods
export const getActivePaymentMethods = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const paymentMethods = await POSPaymentMethod.findActive(restaurantId);

    res.json({
      success: true,
      data: paymentMethods
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get payment method by ID
export const getPaymentMethodById = async (req, res) => {
  try {
    const paymentMethod = await POSPaymentMethod.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.json({
      success: true,
      data: paymentMethod
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create payment method
export const createPaymentMethod = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      transactionFee,
      minAmount,
      maxAmount,
      isActive = true,
      isDefault = false,
      settings
    } = req.body;

    const restaurantId = req.user.restaurant;

    const paymentMethod = await POSPaymentMethod.create({
      restaurant: restaurantId,
      name,
      type,
      description,
      transactionFee,
      minAmount,
      maxAmount,
      isActive,
      isDefault,
      settings,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Payment method created successfully',
      data: paymentMethod
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update payment method
export const updatePaymentMethod = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      transactionFee,
      minAmount,
      maxAmount,
      isActive,
      isDefault,
      settings
    } = req.body;

    const restaurantId = req.user.restaurant;

    const paymentMethod = await POSPaymentMethod.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId },
      {
        name,
        type,
        description,
        transactionFee,
        minAmount,
        maxAmount,
        isActive,
        isDefault,
        settings,
        updatedBy: req.user._id
      },
      { new: true }
    );

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: paymentMethod
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete payment method
export const deletePaymentMethod = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const paymentMethod = await POSPaymentMethod.findOneAndDelete({
      _id: req.params.id,
      restaurant: restaurantId
    });

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toggle payment method status
export const togglePaymentStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const restaurantId = req.user.restaurant;

    const paymentMethod = await POSPaymentMethod.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId },
      { 
        isActive,
        updatedBy: req.user._id
      },
      { new: true }
    );

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    res.json({
      success: true,
      message: `Payment method ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: paymentMethod
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Set default payment method
export const setDefaultPaymentMethod = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    const paymentMethodId = req.params.id;

    // First, unset all default payment methods of this type
    const paymentMethod = await POSPaymentMethod.findById(paymentMethodId);
    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    await POSPaymentMethod.updateMany(
      { 
        restaurant: restaurantId, 
        type: paymentMethod.type,
        _id: { $ne: paymentMethodId }
      },
      { isDefault: false }
    );

    // Set this one as default
    const updatedPaymentMethod = await POSPaymentMethod.findByIdAndUpdate(
      paymentMethodId,
      { 
        isDefault: true,
        updatedBy: req.user._id
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Default payment method set successfully',
      data: updatedPaymentMethod
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Calculate transaction fee
export const calculateTransactionFee = async (req, res) => {
  try {
    const { paymentMethodId, amount } = req.body;

    const paymentMethod = await POSPaymentMethod.findById(paymentMethodId);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    if (!paymentMethod.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is not active'
      });
    }

    // Check amount limits
    if (paymentMethod.minAmount > 0 && amount < paymentMethod.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum amount for this payment method is ₹${paymentMethod.minAmount}`
      });
    }

    if (paymentMethod.maxAmount > 0 && amount > paymentMethod.maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Maximum amount for this payment method is ₹${paymentMethod.maxAmount}`
      });
    }

    const transactionFee = (amount * paymentMethod.transactionFee) / 100;
    const totalAmount = amount + transactionFee;

    res.json({
      success: true,
      data: {
        originalAmount: amount,
        transactionFee,
        totalAmount,
        paymentMethod: {
          name: paymentMethod.name,
          type: paymentMethod.type,
          feePercentage: paymentMethod.transactionFee
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

// Validate payment method
export const validatePaymentMethod = async (req, res) => {
  try {
    const { paymentMethodId, amount } = req.body;

    const paymentMethod = await POSPaymentMethod.findById(paymentMethodId);

    if (!paymentMethod) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    const validation = {
      isValid: true,
      errors: []
    };

    // Check if active
    if (!paymentMethod.isActive) {
      validation.isValid = false;
      validation.errors.push('Payment method is not active');
    }

    // Check amount limits
    if (paymentMethod.minAmount > 0 && amount < paymentMethod.minAmount) {
      validation.isValid = false;
      validation.errors.push(`Minimum amount is ₹${paymentMethod.minAmount}`);
    }

    if (paymentMethod.maxAmount > 0 && amount > paymentMethod.maxAmount) {
      validation.isValid = false;
      validation.errors.push(`Maximum amount is ₹${paymentMethod.maxAmount}`);
    }

    res.json({
      success: true,
      data: validation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
