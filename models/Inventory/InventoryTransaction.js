// import mongoose from "mongoose";

// const inventoryTransactionSchema = new mongoose.Schema({

//   restaurant: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Restaurant",
//     required: true
//   },

//   rawMaterial: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "RawMaterial",
//     required: true
//   },

//   type: {
//     type: String,
//     enum: ["IN", "OUT", "ADJUSTMENT", "WASTAGE"],
//     required: true
//   },

//   quantity: {
//     type: Number,
//     required: true
//   },

//   referenceId: {
//     type: mongoose.Schema.Types.ObjectId
//   },

//   referenceModel: {
//     type: String
//   },

//   note: String

import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema({

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },

  rawMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RawMaterial",
    required: true
  },

  type: {
    type: String,
    enum: [
      "PURCHASE",
      "SALE_DEDUCTION",
      "ADJUSTMENT",
      "WASTAGE",
      "TRANSFER_IN",
      "TRANSFER_OUT",
      "PURCHASE_RETURN"
    ],
    required: true
  },

  quantity: { type: Number, required: true },

  unit: {
    type: String,
    enum: ['purchase', 'consumption'],
    default: 'purchase'
  },

  stockBefore: Number,
  stockAfter: Number,

  referenceId: String,
  referenceModel: String,

  reason: String,
  note: String,
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

export default mongoose.model("InventoryTransaction", inventoryTransactionSchema);