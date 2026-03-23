import mongoose from "mongoose";

const receiveItemSchema = new mongoose.Schema({
  rawMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RawMaterial",
    required: true
  },

  orderedQuantity: {
    type: Number,
    required: true,
    min: 0
  },

  receivedQuantity: {
    type: Number,
    required: true,
    min: 0
  },

  damagedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },

  shortQuantity: {
    type: Number,
    default: 0,
    min: 0
  },

  unitPrice: {
    type: Number,
    min: 0
  },

  total: {
    type: Number,
    min: 0
  }

}, { _id: false });



const purchaseReceiveSchema = new mongoose.Schema({

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },

  purchaseOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PurchaseOrder",
    required: true
  },

  grnNumber: {   
    type: String,
    required: true
  },

  supplierInvoiceNumber: String,

  billingNumber: String,

  receiveDate: {
    type: Date,
    default: Date.now
  },

  items: {
    type: [receiveItemSchema],
    validate: v => v.length > 0
  },

  totalReceivedAmount: {
    type: Number,
    default: 0
  },

  receiveStatus: {
    type: String,
    enum: ["partial", "completed"],
    default: "partial"
  },

  receivedBy: {
    type: String,
    
    required: true
  },

  notes: String,

  // any additional details entered    receiving
  receiveNotes: String,

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });


// Unique GRN per restaurant
purchaseReceiveSchema.index(
  { restaurant: 1, grnNumber: 1 },
  { unique: true }
);

export default mongoose.model("PurchaseReceive", purchaseReceiveSchema);