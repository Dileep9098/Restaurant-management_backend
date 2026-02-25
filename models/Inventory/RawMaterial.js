// import mongoose from "mongoose";

// const rawMaterialSchema = new mongoose.Schema({
//   restaurant: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Restaurant",
//     required: true
//   },
//   name: {
//     type: String,
//     required: true,
//     trim: true
//   },

//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "RawMaterialCategory",
//     required: true
//   },

//   unit: {
//     type: String, // kg, gram, liter, piece
//     required: true
//   },

//   averageCost: {
//     type: Number,
//     default: 0
//   },

//   minStockLevel: {
//     type: Number,
//     default: 0
//   },

//   storageType: {
//     type: String // Freezer, Cold Storage, Normal
//   },

//   isActive: {
//     type: Boolean,
//     default: true
//   }

// }, { timestamps: true });

// export default mongoose.model("RawMaterial", rawMaterialSchema);





import mongoose from "mongoose";

const rawMaterialSchema = new mongoose.Schema({

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },

  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch"
  },

  name: { type: String, required: true, trim: true },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RawMaterialCategory",
    required: true
  },

  purchaseUnit: { type: String  },     
  consumptionUnit: { type: String  },  
  conversionRate: { type: Number  },   

  currentStock: { type: Number, default: 0 },
  averageCost: { type: Number, default: 0 },

  minStockLevel: { type: Number, default: 0 },
  reorderQuantity: { type: Number, default: 0 },

  storageType: { type: String }, 

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

export default mongoose.model("RawMaterial", rawMaterialSchema);