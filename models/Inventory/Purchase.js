

// import mongoose from "mongoose";

// const purchaseItemSchema = new mongoose.Schema({
//   rawMaterial: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "RawMaterial",
//     required: true
//   },

//   quantity: {
//     type: Number,
//     required: true,
//     min: 0
//   },

//   pricePerUnit: {
//     type: Number,
//     required: true,
//     min: 0
//   },

//   taxPercent: {
//     type: Number,
//     default: 0
//   },

//   discount: {
//     type: Number,
//     default: 0
//   },

//   total: {
//     type: Number,
//     required: true
//   },

//   receivedQuantity: {
//     type: Number,
//     default: 0
//   }

// }, { _id: false });


// const purchaseSchema = new mongoose.Schema({

//   restaurant: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Restaurant",
//     required: true
//   },

//   branch: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Branch"
//   },

//   supplier: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Supplier",
//     required: true
//   },

//   purchaseNumber: {
//     type: String,
//     required: true
//   },

//   supplierInvoiceNumber: String,

  // extra billing/reference number provided at receive time
  // billingNumber: String,

//   purchaseDate: {
//     type: Date,
//     default: Date.now
//   },

//   dueDate: Date,

//   items: {
//     type: [purchaseItemSchema],
//     validate: v => v.length > 0
//   },

//   subTotal: { type: Number, default: 0 },
//   totalTax: { type: Number, default: 0 },
//   totalDiscount: { type: Number, default: 0 },
//   totalAmount: { type: Number, default: 0 },

//   paidAmount: { type: Number, default: 0 },
//   balanceAmount: { type: Number, default: 0 },

//   paymentStatus: {
//     type: String,
//     enum: ["pending", "partial", "paid"],
//     default: "pending"
//   },

//   status: {
//     type: String,
//     enum: [
//       "draft",
//       "ordered",
//       "partially_received",
//       "received",
//       "cancelled"
//     ],
//     default: "draft"
//   },

//   orderedAt: Date,
//   receivedAt: Date,

//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User"
//   },

//   notes: String,

//   attachments: [String],

//   isActive: {
//     type: Boolean,
//     default: true
//   }

// }, { timestamps: true });

// purchaseSchema.index({ restaurant: 1, purchaseNumber: 1 }, { unique: true });

// export default mongoose.model("Purchase", purchaseSchema);






import mongoose from "mongoose";

const purchaseOrderItemSchema = new mongoose.Schema({
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

  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },

  taxPercent: {
    type: Number,
    default: 0
  },

  discount: {
    type: Number,
    default: 0
  },

  total: {
    type: Number,
    required: true
  }

}, { _id: false });


const purchaseOrderSchema = new mongoose.Schema({

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },

  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RawMaterialCategory"
  },

  poNumber: {
    type: String,
    required: true
  },

  poDate: {
    type: Date,
    default: Date.now
  },

  expectedDeliveryDate: Date,

  items: {
    type: [purchaseOrderItemSchema],
    validate: v => v.length > 0
  },

  subTotal: Number,
  totalTax: Number,
  totalDiscount: Number,
  totalAmount: Number,

  status: {
    type: String,
    enum: ["draft", "ordered", "partially_received", "received", "cancelled"],
    default: "draft"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  notes: String,

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

export default mongoose.model("PurchaseOrder", purchaseOrderSchema);