import mongoose from 'mongoose';

const DiscountSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        if (this.type === 'percentage') {
          return value <= 100;
        }
        return value <= 999999;
      },
      message: function(props) {
        if (this.type === 'percentage') {
          return 'Percentage discount cannot exceed 100';
        }
        return 'Fixed amount discount cannot exceed 999999';
      }
    }
  },
  minAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscount: {
    type: Number,
    default: 0,
    min: 0
  },
  applicableTo: {
    type: String,
    enum: ['all', 'menu-items', 'categories'],
    default: 'all'
  },
  menuItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem'
  }],
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuCategory'
  }],
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    min: 1
  },
  usageCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
DiscountSchema.index({ restaurant: 1, isActive: 1 });
DiscountSchema.index({ restaurant: 1, name: 1 });
DiscountSchema.index({ restaurant: 1, startDate: 1, endDate: 1 });

// Validation for date range
DiscountSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    next(new Error('Start date must be before end date'));
  } else {
    next();
  }
});

// Static method to find active discounts
DiscountSchema.statics.findActive = function(restaurantId) {
  const now = new Date();
  return this.find({
    restaurant: restaurantId,
    isActive: true,
    $or: [
      { startDate: null },
      { startDate: { $lte: now } }
    ],
    $or: [
      { endDate: null },
      { endDate: { $gte: now } }
    ]
  });
};

// Static method to check if discount is applicable
DiscountSchema.statics.isApplicable = function(discountId, orderAmount, menuItemId = null) {
  return this.findById(discountId).then(discount => {
    if (!discount || !discount.isActive) return false;
    
    // Check date range
    const now = new Date();
    if (discount.startDate && discount.startDate > now) return false;
    if (discount.endDate && discount.endDate < now) return false;
    
    // Check minimum amount
    if (orderAmount < discount.minAmount) return false;
    
    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) return false;
    
    // Check applicability to specific items/categories
    if (discount.applicableTo !== 'all' && menuItemId) {
      if (discount.applicableTo === 'menu-items') {
        return discount.menuItems.includes(menuItemId);
      }
    }
    
    return true;
  });
};

export default mongoose.model('Discount', DiscountSchema);
