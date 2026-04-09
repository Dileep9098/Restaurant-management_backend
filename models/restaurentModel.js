// models/Restaurant.js
import mongoose from "mongoose";
const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  outletCode: { type: String, unique: true },
  phone: String,
  email: String,

  address: { 
    line1: String,
    city: String,
    state: String,
    pincode: String
  },

  gstNumber: String,
  isActive: { type: Boolean, default: true },
  // logo:{ type: String,default:"resLogo.png" },
  logo: { type: String, default: "resLogo.png" },
  qrCodeForPayment: { type: String, default: "qrcodePayment.png" },

serviceType: {
    type: String,
    enum: ["dine_in", "qsr", "hybrid"],
    default: "dine_in"
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  invoiceTemplate: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "InvoiceTemplate",
}

}, { timestamps: true });

const Restaurent= mongoose.model("Restaurant", restaurantSchema);
export default Restaurent;
