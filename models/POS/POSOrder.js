import mongoose from 'mongoose';

const POSOrderSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  orderType: {
    type: String,
    enum: ['dine-in', 'takeaway', 'delivery'],
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
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String,
    fullAddress: String
  },
  items: [{
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true
    },
    name: String,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
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
  deliveryFee: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'wallet']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  estimatedTime: {
    type: Number,
    default: 15
  },
  actualTime: Number,
  notes: {
    type: String,
    trim: true
  },
  orderNotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderNote'
  }],
  discounts: [{
    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discount'
    },
    amount: Number
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  completedAt: Date,
  cancelledAt: Date,
  cancelledReason: String
}, {
  timestamps: true
});

// Indexes for better performance
POSOrderSchema.index({ restaurant: 1, orderNumber: 1 });
POSOrderSchema.index({ restaurant: 1, status: 1 });
POSOrderSchema.index({ restaurant: 1, orderType: 1 });
POSOrderSchema.index({ restaurant: 1, createdAt: -1 });

// Pre-save middleware to calculate totals
POSOrderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.subtotal = this.items.reduce((total, item) => {
      item.subtotal = item.quantity * item.price;
      return total + item.subtotal;
    }, 0);
    
    this.totalAmount = this.subtotal + this.tax + (this.deliveryFee || 0) - this.discount;
  }
  next();
});

export default mongoose.model('POSOrder', POSOrderSchema);
