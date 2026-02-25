import mongoose from "mongoose";

const supplierLedgerSchema = new mongoose.Schema({

  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },

  type: {
    type: String,
    enum: ["PURCHASE", "PAYMENT", "RETURN"]
  },

  debit: Number,
  credit: Number,
  balanceAfter: Number,

  referenceId: mongoose.Schema.Types.ObjectId,
  referenceModel: String

}, { timestamps: true });
export default mongoose.model("SupplierLedger", supplierLedgerSchema);