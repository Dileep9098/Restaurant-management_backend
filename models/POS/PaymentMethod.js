import mongoose from 'mongoose';

const PaymentMethodSchema = new mongoose.Schema({
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
    enum: ['cash', 'card', 'upi', 'wallet'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  transactionFee: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  minAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  settings: {
    // For card payments
    cardTypes: [String],
    // For UPI payments
    upiApps: [String],
    // For wallet payments
    walletProviders: [String],
    // Additional configuration
    requiresApproval: {
      type: Boolean,
      default: false
    },
    autoSettle: {
      type: Boolean,
      default: false
    },
    settlementTime: String // in hours or days
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
PaymentMethodSchema.index({ restaurant: 1, isActive: 1 });
PaymentMethodSchema.index({ restaurant: 1, type: 1 });
PaymentMethodSchema.index({ restaurant: 1, isDefault: 1 });

// Pre-save middleware to ensure only one default payment method per type
PaymentMethodSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { 
        restaurant: this.restaurant, 
        type: this.type, 
        _id: { $ne: this._id } 
      },
      { isDefault: false }
    );
  }
  next();
});

// Static method to get active payment methods
PaymentMethodSchema.statics.findActive = function(restaurantId) {
  return this.find({
    restaurant: restaurantId,
    isActive: true
  }).sort({ isDefault: -1, name: 1 });
};

// Static method to get default payment method
PaymentMethodSchema.statics.getDefault = function(restaurantId, type = null) {
  const query = {
    restaurant: restaurantId,
    isActive: true
  };
  
  if (type) {
    query.type = type;
  }
  
  return this.findOne(query).sort({ isDefault: -1, name: 1 });
};

export default mongoose.model('POSPaymentMethod', PaymentMethodSchema);
