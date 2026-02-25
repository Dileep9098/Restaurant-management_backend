import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: String,
  email: String,
  address: {
    type: String,
    maxlength: 500
  },
  gstNumber: String,
  panNumber: String,
  paymentTerms: {
    type: String,
    enum: ['cash', 'credit_7_days', 'credit_15_days', 'credit_30_days'],
    default: 'cash'
  },
  bankDetails: {
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    accountHolderName: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model("Supplier", supplierSchema);