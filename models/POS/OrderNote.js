import mongoose from 'mongoose';

const OrderNoteSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'POSOrder',
    required: true
  },
  note: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['general', 'cooking', 'delivery', 'payment', 'priority'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isInternal: {
    type: Boolean,
    default: false // Internal notes are not shown to customers
  },
  isRead: {
    type: Boolean,
    default: false
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  readAt: Date
}, {
  timestamps: true
});

// Indexes
OrderNoteSchema.index({ order: 1, createdAt: -1 });
OrderNoteSchema.index({ restaurant: 1, isRead: 1 });
OrderNoteSchema.index({ addedBy: 1 });
OrderNoteSchema.index({ restaurant: 1, priority: 1, createdAt: -1 });

// Static method to get unread notes
OrderNoteSchema.statics.findUnread = function(restaurantId, userId = null) {
  const query = {
    restaurant: restaurantId,
    isRead: false
  };
  
  if (userId) {
    query.addedBy = { $ne: userId }; // Don't count own notes as unread
  }
  
  return this.find(query)
    .populate('addedBy', 'name email')
    .populate('order', 'orderNumber')
    .sort({ priority: -1, createdAt: -1 });
};

// Static method to mark notes as read
OrderNoteSchema.statics.markAsRead = function(noteIds, userId) {
  return this.updateMany(
    { _id: { $in: noteIds } },
    { 
      isRead: true,
      readBy: userId,
      readAt: new Date()
    }
  );
};

export default mongoose.model('OrderNote', OrderNoteSchema);
