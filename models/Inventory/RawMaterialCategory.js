// import mongoose from "mongoose";

// const rawMaterialCategorySchema = new mongoose.Schema({
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
//   description: String,
//   isActive: {
//     type: Boolean,
//     default: true
//   }
// }, { timestamps: true });

// export default mongoose.model("RawMaterialCategory", rawMaterialCategorySchema);


import mongoose from "mongoose";

const rawMaterialCategorySchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true   // prevent case duplication
    },

    description: {
      type: String,
      maxlength: 500
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// 🔥 Unique per restaurant
rawMaterialCategorySchema.index(
  { restaurant: 1, name: 1 },
  { unique: true }
);

export default mongoose.model(
  "RawMaterialCategory",
  rawMaterialCategorySchema
);