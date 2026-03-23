import mongoose from 'mongoose';

const DineInTableSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  tableNumber: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'cleaning'],
    default: 'available'
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'POSOrder'
  },
  reservedBy: {
    customerName: String,
    customerPhone: String,
    reservationTime: Date,
    expectedTime: Date
  },
  qrCode: String,
  isActive: {
    type: Boolean,
    default: true
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

// Compound index for restaurant and table number
DineInTableSchema.index({ restaurant: 1, tableNumber: 1 }, { unique: true });
DineInTableSchema.index({ restaurant: 1, status: 1 });
DineInTableSchema.index({ restaurant: 1, isActive: 1 });

// Pre-save middleware to ensure table number is uppercase
DineInTableSchema.pre('save', function(next) {
  if (this.tableNumber) {
    this.tableNumber = this.tableNumber.toUpperCase().trim();
  }
  next();
});

export default mongoose.model('DineInTable', DineInTableSchema);
