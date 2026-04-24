import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema.Types;

const expenseSchema = new mongoose.Schema({
  restaurantId: { type: ObjectId, ref: "Restaurant", required: true },

  title: { type: String, required: true }, // Milk, Salary, Electricity
  amount: { type: Number, required: true },

  category: {
    type: String,
    enum: ["RAW_MATERIAL", "SALARY", "UTILITY", "RENT", "MAINTENANCE", "MARKETING", "OTHER"],
    default: "OTHER"
  },

  subCategory: { type: String }, // e.g. Milk, Vegetables, Facebook Ads

  paymentMethod: {
    type: String,
    enum: ["CASH", "UPI", "CARD", "BANK_TRANSFER"],
    default: "CASH"
  },

  paymentStatus: {
    type: String,
    enum: ["PAID", "PENDING"],
    default: "PAID"
  },

  vendorName: { type: String }, // Supplier name
  vendorContact: { type: String },

  billNumber: { type: String }, // invoice number
  billImage: { type: String }, // Cloudinary URL

  quantity: { type: Number }, // e.g. 10kg
  unit: { type: String }, // kg, litre, piece

  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number }, // amount + tax

  isRecurring: { type: Boolean, default: false }, // salary, rent
  recurringType: {
    type: String,
    enum: ["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]
  },

  expenseDate: {
    type: Date,
    default: Date.now
  },

  approvedBy: { type: ObjectId, ref: "User" }, // manager approval

  status: {
    type: String,
    enum: ["ACTIVE", "DELETED"],
    default: "ACTIVE"
  },

  note: String,

  createdBy: { type: ObjectId, ref: "User" },
  updatedBy: { type: ObjectId, ref: "User" }

}, { timestamps: true });

// Calculate totalAmount before saving
expenseSchema.pre("save", function(next) {
  if (this.isModified("amount") || this.isModified("taxAmount")) {
    this.totalAmount = this.amount + (this.taxAmount || 0);
  }
  next();
});

// Index for better query performance
expenseSchema.index({ restaurantId: 1, expenseDate: -1 });
expenseSchema.index({ restaurantId: 1, category: 1 });
expenseSchema.index({ restaurantId: 1, status: 1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
