// import mongoose from "mongoose";

// const orderItemSchema = new mongoose.Schema({

//     UserID: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User'
//     },
//     // OrderNote: {
//     //     type: String,
//     //     default: ""
//     // },

//     PaymentMethod: {
//         type: String,
//     },

//     cartJsonData: [
//        { type: String,
//         default: ""}
//     ],

//     // CouponCode: {
//     //     type: String,
//     //     default: ""
//     // },
//     // paymentToken: {
//     //     type: String,
//     //     default: ""
//     // },
//     // payPalOrderConfirmJson: {
//     //     type: String,
//     //     default: ""
//     // },
//     bank_ref_num: {
//         type: String,
//         default: ""
//     },
//     totalOrderPrice: {
//         type: String,
//         default: ""
//     },
//     Status: {
//         type: String,
//         default: "Active"
//     },
//     OrderNumber: {
//         type: String,
//         default: ""
//     },
//     // txnid: {
//     //     type: String,
//     // },
//     // mihpayid: {
//     //     type: String,
//     // },



// }, {
//     timestamps: true
// })

// // module.exports=mongoose.model("ParentCategory",childCategorySchema)
// const OrderItem = mongoose.model("OrderItem", orderItemSchema)

// export default OrderItem;


// models/orderModel.js
// models/Order.js

// import mongoose from "mongoose";
// const orderSchema = new mongoose.Schema({
//   orderNumber: String,

//   orderType: {
//     type: String,
//     enum: ["DINE_IN", "TAKEAWAY", "ONLINE"]
//   },

//   status: {
//     type: String,
//     enum: ["NEW", "PREPARING", "READY", "COMPLETED", "CANCELLED"],
//     default: "NEW"
//   },

//   items: [
//     {
//       item: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
//       qty: Number,
//       price: Number
//     }
//   ],

//   subTotal: Number,
//   taxAmount: Number,
//   discountAmount: Number,
//   grandTotal: Number,

//   customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" }
// }, { timestamps: true });

// const Order = mongoose.model("Order", orderSchema);
// export default Order;






import mongoose from "mongoose";

const orderVariantSchema = new mongoose.Schema({
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant"
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    default: 1
  }
}, { _id: false });

const orderItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenuItem",
    required: true
  },
  name: {
    type: String,
  },
  basePrice: {
    type: Number,
  },
  variants: [orderVariantSchema],

  quantity: {
    type: Number,
  },

  totalPrice: {
    type: Number,
  },
  image: [{type: String}]

}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },

  orderType: {
    type: String,
    enum: ["DINE_IN", "TAKEAWAY", "ONLINE"],
    required: true
  },

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },

  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Table"
  },

  customerName: {
    type: String,
    default: "Guest"
  },
  waiterName: {
    type: String,
    default: "Waiter"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  items: {
    type: [orderItemSchema],
    required: true
  },

  subTotal: {
    type: Number,
    required: true
  },

  taxAmount: {
    type: Number,
    default: 0
  },

  discountAmount: {
    type: Number,
    default: 0
  },

  grandTotal: {
    type: Number,
  },

  orderStatus: {
    type: String,
    enum: [
      "NEW",
      "PREPARING",
      "READY",
      "SERVED",
      "COMPLETED",
      "CANCELLED"
    ],
    default: "NEW"
  },
  orderAccessToken: {
    type: String,
    // required: true
  },

  preparationTime: {
    type: Number, // in minutes
    default: 0
  },

  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED"],
    default: "PENDING"
  },
  tokenBillNumber: {
    type: String,
  },

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
