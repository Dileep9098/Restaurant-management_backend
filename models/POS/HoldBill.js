import mongoose from 'mongoose';

const HoldBillSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  billNumber: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  tableNumber: {
    type: String,
    trim: true
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
    required: true
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem'
    },
    name: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    trim: true
  },
  heldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resumedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resumedAt: Date,
  isResumed: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
}, {
  timestamps: true
});

// Indexes
HoldBillSchema.index({ restaurant: 1, billNumber: 1 });
HoldBillSchema.index({ restaurant: 1, isResumed: 1 });
HoldBillSchema.index({ restaurant: 1, expiresAt: 1 });
HoldBillSchema.index({ heldBy: 1 });

// Pre-save middleware
HoldBillSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((total, item) => {
      item.subtotal = item.quantity * item.price;
      return total + item.subtotal;
    }, 0);
    
    this.totalAmount = this.subtotal + this.tax - this.discount;
  }
  next();
});

// Static method to find expired hold bills
HoldBillSchema.statics.findExpired = function(restaurantId) {
  return this.find({
    restaurant: restaurantId,
    isResumed: false,
    expiresAt: { $lt: new Date() }
  });
};

export default mongoose.model('HoldBill', HoldBillSchema);
