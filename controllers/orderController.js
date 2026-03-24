// import Notification from "../models/notificationModel.js";
// import Order from "../models/orderModel.js";
// import SimData from "../models/SimDataModel.js";
// import User from "../models/userModel.js";
// import { io } from "../server.js";
import fs from "fs";
import path from "path";


// const generateOrderNumber = async () => {
//   const orderCount = await Order.countDocuments();
//   const orderNumber = `OR#${(orderCount + 1).toString().padStart(8, '0')}`;
//   console.log(orderNumber)
//   return orderNumber;
// };


// export const placeOrder = async (req, res) => {
//   try {
//     const { items, totalAmount } = req.body;
//     const UserID = req.user._id;

//     const user = await User.findById(UserID);

//     if (!user || user.role !== "vendor") {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     // Check wallet balance
//     if (user.wallet < totalAmount) {
//       return res.status(400).json({ message: "Insufficient wallet balance" });
//     }

//     const orderNumber = await generateOrderNumber();


//     // Create order
//     const newOrder = await Order.create({
//       UserID: UserID,
//       OrderNumber: orderNumber,
//       items,
//       totalAmount
//     });

//     // Deduct amount from wallet
//     user.wallet -= totalAmount;
//     // user.walletTransactions.push({
//     //   type: "DEBIT",
//     //   amount: totalAmount,
//     //   description: `Order #${newOrder._id} payment of ₹${totalAmount}`

//     // });

//     // const itemNames = items.map(item => item.packageId?.name || "Package").join(", ");
//     await newOrder.populate("items.packageId");

//     const itemNames = newOrder.items.map(item => item.packageId?.name || "Package").join(", ");


//     user.walletTransactions.push({
//       type: "DEBIT",
//       amount: totalAmount,
//       description: `Order for ${itemNames} - ₹${totalAmount} debited from wallet`
//     });

//     io.to((UserID).toString()).emit("new_walletAmount", user.wallet);

//     await user.save();

//     const admins = await User.find({ role: "admin" });

//     for (const admin of admins) {
//       const notification = new Notification({
//         sender: UserID,
//         receiver: admin._id,
//         message: `User ${req.user.name} placed Order #${newOrder.OrderNumber} of ₹${totalAmount}`,
//         type: "ORDER"
//       });

//       await notification.save();
//       io.to((admin._id).toString()).emit("new_notification", notification);
//     }



//     res.status(201).json({
//       message: "Order placed successfully",
//       order: newOrder
//     });

//   } catch (error) {
//     console.log("Order Error:", error);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };


// export const getAllOrders = async (req, res) => {

//   const orderCount = await Order.countDocuments()

//   try {
//     const findOrder = await Order.find().sort({ createdAt: -1 }).populate("UserID");

//     if (!findOrder || findOrder.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "findOrder Not Found",
//       });
//     }
//     let totalAmount = 0;

//     findOrder.forEach((order) => {
//       const orderPrice = order.totalAmount;
//       if (orderPrice !== null && orderPrice !== undefined && !isNaN(parseFloat(orderPrice))) {
//         totalAmount += parseFloat(orderPrice);
//       }
//       //  else {
//       //   console.log("Invalid Order Price:", orderPrice); // For debugging invalid values
//       // }
//     });

//     res.status(200).json({
//       success: true,
//       findOrder,
//       orderCount,
//       totalAmount
//     });

//   } catch (error) {
//     console.error("Error fetching findOrder:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server Error while fetching findOrder",
//     });
//   }
// }



// export const getSingleOrder = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate("UserID", "name email phone city status -password")
//       .populate("items.packageId");

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     res.status(200).json({ success: true, order });
//   } catch (error) {
//     console.error("Get Single Order Error:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };

// export const getMyOrders = async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const orders = await Order.find({ UserID: userId }).sort({ createdAt: -1 })
//       .sort({ createdAt: -1 })
//       .populate("items.packageId")
//       .populate("UserID", "name email -password");

//     res.status(200).json({ success: true, orders });
//   } catch (error) {
//     console.error("Get My Orders Error:", error);
//     res.status(500).json({ success: false, message: "Internal Server Error" });
//   }
// };



// export const markOrderAsShipped = async (req, res) => {
//   try {
//     const orderId = req.params.id;

//     const order = await Order.findById(orderId).populate("UserID");
//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const userId = order.UserID._id;
//     const userName = order.UserID.name;

//     // Calculate total quantity from all items
//     const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

//     // Get unassigned SIMs
//     const availableSims = await SimData.find({ isAssigned: false }).limit(totalQuantity);

//     if (availableSims.length < totalQuantity) {
//       return res.status(400).json({ message: "Not enough available SIMs" });
//     }

//     // Assign SIMs
//     for (let i = 0; i < totalQuantity; i++) {
//       availableSims[i].isAssigned = true;
//       availableSims[i].assignedTo = userId;
//       availableSims[i].userName = userName; // add this in schema if not present
//       await availableSims[i].save();
//     }

//     // Update order status
//     order.status = "Shipped";
//     await order.save();

//     res.status(200).json({
//       message: `Order marked as shipped. ${totalQuantity} SIMs assigned to ${userName}`,
//     });
//   } catch (error) {
//     console.error("Error in shipping order:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getSingleOrder = async (req, res, next) => {
//   const order = await Order.findById(req.params.id).populate("UserID");

//   // if (!order) {
//   //   return next(new ErrorHandler("Order not found with this Id", 404));
//   // }
//   if (!order) {
//     return res.status(404).json({
//       success: false,
//       message: "Order not found with this Id",
//     });
//   }

//   // const paymentDetails = await PaymentMethod.find({ 'displaySeqNo': { $in: order.PaymentMethod } });



//   res.status(200).json({
//     success: true,
//     order
//   });
// }



// exports.myOrders = catchAsyncError(async (req, res, next) => {
//   const data = req.body; // Get the data from the body
//   console.log("Request Body:", data); // Log the full request body to see its contents
//   const userID = data.UserID || req.body.UserID; // Extract UserID from request body

//   if (!userID) {
//     return res.status(400).json({
//       success: false,
//       message: 'UserID is required',
//     });
//   }

//   const orders = await OrderItem.find({ UserID: userID });
//   console.log("Found orders:", orders); // Log orders fetched from DB

//   res.status(200).json({
//     success: true,
//     orders,
//   });
// });

// exports.deleteMyOrders = catchAsyncError(async (req, res, next) => {
//   const data = req.body;
//   console.log("Request Body:", data);

//   const id = data.id || req.body.id;

//   if (!id) {
//     return res.status(400).json({
//       success: false,
//       message: 'Order ID is required',
//     });
//   }

//   try {
//     // Use _id for the delete query, assuming you're using MongoDB
//     const order = await OrderItem.deleteOne({ _id: id });
//     const shippingDetails = await ShippingDetails.deleteOne({ 'orderItem': id });


//     if (order.deletedCount === 0) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found',
//       });
//     }

//     console.log("Deleted order:", order);

//     res.status(200).json({
//       success: true,
//       message: "Order deleted successfully",
//     });
//   } catch (error) {
//     console.error("Error deleting order:", error);
//     return res.status(500).json({
//       success: false,
//       message: 'Something went wrong while deleting the order.',
//     });
//   }
// });


// // get all Orders -- Admin
// exports.getAllOrders = catchAsyncError(async (req, res, next) => {
//   const orders = await OrderItem.find().sort({ createdAt: -1 }).populate("UserID");

//   let totalAmount = 0;

//   orders.forEach((order) => {
//     totalAmount += parseFloat(order.totalOrderPrice);
//   });

//   console.log("Kya total hai",totalAmount)

//   res.status(200).json({
//     success: true,
//     totalAmount,
//     orders,
//   });
// });





// exports.getAllOrders = catchAsyncError(async (req, res, next) => {
//   try {
//     const orders = await OrderItem.find().sort({ createdAt: -1 }).populate("UserID");

//     let totalAmount = 0;

//     orders.forEach((order) => {
//       const orderPrice = order.totalOrderPrice;
//       if (orderPrice !== null && orderPrice !== undefined && !isNaN(parseFloat(orderPrice))) {
//         totalAmount += parseFloat(orderPrice);
//       }
//       //  else {
//       //   console.log("Invalid Order Price:", orderPrice); // For debugging invalid values
//       // }
//     });

//     console.log("Final Total Amount:", totalAmount); // Check totalAmount before sending response

//     res.status(200).json({
//       success: true,
//       totalAmount,
//       orders,
//     });
//   } catch (error) {
//     next(error); // Pass any error to the global error handler
//   }
// });


// // update Order Status -- Admin
// exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
//   const order = await Order.findById(req.params.id);

//   if (!order) {
//     return next(new ErrorHander("Order not found with this Id", 404));
//   }

//   if (order.orderStatus === "Delivered") {
//     return next(new ErrorHander("You have already delivered this order", 400));
//   }

//   if (req.body.status === "Shipped") {
//     order.orderItems.forEach(async (o) => {
//       await updateStock(o.product, o.quantity);
//     });
//   }
//   order.orderStatus = req.body.status;

//   if (req.body.status === "Delivered") {
//     order.deliveredAt = Date.now();
//   }

//   await order.save({ validateBeforeSave: false });
//   res.status(200).json({
//     success: true,
//   });
// });

// async function updateStock(id, quantity) {
//   const product = await Product.findById(id);

//   product.Stock -= quantity;

//   await product.save({ validateBeforeSave: false });
// }

// // delete Order -- Admin
// exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
//   const order = await Order.findById(req.params.id);

//   if (!order) {
//     return next(new ErrorHander("Order not found with this Id", 404));
//   }

//   await order.remove();

//   res.status(200).json({
//     success: true,
//   });
// });




// exports.addShippingDetails = catchAsyncError(async (req, res, next) => {
//   // Fetch order details using order ID
//   const order = await OrderItem.findById(req.params.id).populate("UserID");

//   if (!order) {
//     return next(new ErrorHander("Order not found with this Id", 404));
//   }

//   const cartItems = JSON.parse(order.cartJsonData);

//   for (const item of cartItems) {
//     const shippingDetail = {
//       orderItem: order._id,
//       ProductImage: item.DefaultImage,
//       ProductName: item.ProductName,
//       shippingStatus:order.Status

//     };

//     await ShippingDetails.create(shippingDetail);
//   }

//   res.status(200).json({
//     success: true,
//     message: "Shipping details added successfully."
//   });
// });


// exports.getShippingDetails = catchAsyncError(async (req, res, next) => {
//   // Fetch order details using order ID
//   const shippingDetails = await ShippingDetails.find({ 'orderItem': { $in: req.params.id } }).populate(["orderItem", "UserID"]);

//   if (!shippingDetails) {
//     return next(new ErrorHandler("Order not found with this Id", 404));
//   }

//   res.status(200).json({
//     success: true,
//     shippingDetails,
//     message: "Shipping details successfully."
//   });
// });


// exports.updateShippingDetails = catchAsyncError(async (req, res, next) => {
//   const data = req.body;
//   console.log("update Data me Details kya hai", data);

//   // Find the ShippingDetails by orderItem ID
//   const shippingDetails = await ShippingDetails.findOne({ 'orderItem': { $in: req.params.id } }).populate(["orderItem", "UserID"]);

//   if (!shippingDetails) {
//     return next(new ErrorHandler("Order not found with this Id", 404));
//   }

//   // Update the shipping details with the new data
//   shippingDetails.shipper = data.Shipper || shippingDetails.shipper;
//   shippingDetails.length = data.length || shippingDetails.length;
//   shippingDetails.height = data.height || shippingDetails.height;
//   shippingDetails.weight = data.weight || shippingDetails.weight;
//   shippingDetails.breadth = data.breadth || shippingDetails.breadth;
//   shippingDetails.TrackingNumber = data.TrackingNumber || shippingDetails.TrackingNumber;
//   shippingDetails.departure_date = data.departureDate || shippingDetails.departure_date;
//   shippingDetails.receiver_date = data.receivedDate || shippingDetails.receiver_date;
//   shippingDetails.shippingMethod = data.shippingMethod || shippingDetails.shippingMethod;
//   shippingDetails.shippingStatus = data.ShippingStatus || shippingDetails.shippingStatus;  // Fixed this line
//   shippingDetails.receiver_name = data.receiverName || shippingDetails.receiver_name;
//   shippingDetails.receiver_mobile = data.receiverMobile || shippingDetails.receiver_mobile;
//   shippingDetails.receiver_indentity_no = data.receiverIdentityNo || shippingDetails.receiver_indentity_no;

//   // Save the updated shipping details
//   await shippingDetails.save();

//   const findOrder = await OrderItem.findById(req.params.id);

//   if (findOrder) {
//     findOrder.Status = data.ShippingStatus || findOrder.Status;
//     await findOrder.save();
//     console.log("Order Ka Status kya hai", findOrder.Status);
//   } else {
//     return next(new ErrorHandler("OrderItem not found with this Id", 404));
//   }


//   // -----------------------------------------||||||   Check Shiprocket Token   ||||------------------------

//   try {
//     if (data.ShippingStatus === "Shipped") {
//       const tokenValid = await ShiprocketToken.find();
//       console.log("Mil kya kya rha hai", tokenValid);

//       const added_on = tokenValid[0].added_on;
//       const current_time = Date.now();
//       const added_on_timestamp = new Date(added_on).getTime();
//       const diff_time = (current_time - added_on_timestamp) / 1000;
//       console.log("Time Different Kya hai (in seconds)", diff_time);

//       let AddShiprocketInfo;
//       if (diff_time > 0) {
//         const token = await generateShipRocketToken();
//         console.log("Token mila kya", token);
//         const shippingDetails = await ShippingDetails.findOne({ 'orderItem': { $in: req.params.id } }).populate(["orderItem", "UserID"]);

//         AddShiprocketInfo = await PlaceAndConfirmCustomerOrder({ token: token, order_id: req.params.id, length: shippingDetails.length, height: shippingDetails.heigth, weight: shippingDetails.weight, breadth: shippingDetails.baseModelName })
//       }
//       else {
//         const token = tokenValid[0].token
//         const shippingDetails = await ShippingDetails.findOne({ 'orderItem': { $in: req.params.id } }).populate(["orderItem", "UserID"]);

//         AddShiprocketInfo = await PlaceAndConfirmCustomerOrder({ token: token, order_id: req.params.id, length: shippingDetails.length, height: shippingDetails.heigth, weight: shippingDetails.weight, breadth: shippingDetails.baseModelName })
//       }



//       console.log("Shiprocket ka response kya hau", AddShiprocketInfo)

//       shippingDetails.shiprocket_order_id = AddShiprocketInfo.order_id || AddShiprocketInfo.channel_order_id
//       shippingDetails.shiprocket_shipment_id = AddShiprocketInfo.shipment_id || AddShiprocketInfo.channel_order_id
//       await shippingDetails.save();

//     }
//   } catch (error) {
//     console.log(error);
//   }

//   res.status(200).json({
//     success: true,
//     message: "Shipping details and order status updated successfully",
//     shippingDetails
//   });
// });


// const generateShipRocketToken = async () => {
//   const email = "dileepsahu0873@gmail.com";
//   const password = "Dileep@0873";

//   // Fetch the current Shiprocket token data
//   const updateData = await ShiprocketToken.find();

//   // Make the request to Shiprocket API
//   const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', { email, password });
//   console.log("Shiprocket response: ", response.data);

//   // Update the first document in updateData with the new token and timestamp
//   const tokenData = updateData[0];
//   tokenData.added_on = Date.now();
//   tokenData.token = response.data.token;

//   // Save the updated document
//   await tokenData.save();

//   // Return the new token
//   return response.data.token;
// }


// const PlaceAndConfirmCustomerOrder = async (param) => {
//   const { token, order_id, length, height, weight, breadth } = param;

//   if (!token) {
//     console.log("Shiprocket token not available.");
//     return;
//   }

//   // Fetch order details with user information
//   const orderDetails = await OrderItem.findById(order_id).populate("UserID");
//   if (!orderDetails) {
//     console.log("Order not found.");
//     return;
//   }

//   console.log(orderDetails)
//   const user = orderDetails.UserID;
//   const cartItems = orderDetails.cartJsonData.length > 0 ? JSON.parse(orderDetails.cartJsonData[0]) : [];

//   if (!cartItems || cartItems.length === 0) {
//     console.log("Cart items are missing.");
//     return;
//   }

//   // Assuming payment method details are fetched from PaymentMethod
//   const paymentDetails = await PaymentMethod.find({ 'displaySeqNo': { $in: [orderDetails.PaymentMethod] } });
//   const paymentMethod = paymentDetails.length > 0 ? paymentDetails[0].name : 'Unknown';

//   const params = {
//     "order_id": `order_${order_id}`,
//     "order_date": new Date().toISOString(),
//     "pickup_location": "PARIJAT HANDICRAFT",
//     "comment": "Reseller: M/s Goku",
//     "billing_customer_name": user.name,
//     "billing_last_name": user.lname,
//     "billing_address": user.address,
//     "billing_city": user.CityName,
//     "billing_pincode": user.PostalCode,
//     "billing_state": user.StateName,
//     "billing_country": user.CountryName,
//     "billing_email": user.email,
//     "billing_phone": user.phone,
//     "shipping_is_billing": true,
//     "shipping_customer_name": user.name,
//     "shipping_last_name": user.lname,
//     "shipping_address": user.address,
//     "shipping_city": user.CityName,
//     "shipping_pincode": user.PostalCode,
//     "shipping_country": user.CountryName,
//     "shipping_state": user.StateName,
//     "shipping_email": user.email,
//     "shipping_phone": user.phone,
//     "order_items": cartItems.map(item => ({
//       name: item.ProductName,
//       sku: item.ProductId,
//       units: item.Quantity,
//       selling_price: item.Price || 0,
//     })),
//     "payment_method": paymentMethod == "PayU" ? "Prepaid" : paymentMethod,
//     "sub_total": orderDetails.totalOrderPrice,
//     "total_discount": orderDetails.totalDiscount || 0,
//     "length": length || 10,
//     "breadth": breadth || 15,
//     "height": height || 20,
//     "weight": weight || 2.5,
//   };

//   // Validate required fields
//   if (!params.billing_customer_name || !params.billing_address || !params.billing_phone || !params.billing_pincode || !params.order_items) {
//     console.log("Some required billing or order item fields are missing.");
//     return;
//   }

//   try {
//     const headers = {
//       "Content-Type": "application/json",
//       "Authorization": `Bearer ${token}`,
//     };

//     console.log("Shiprocket Order Request Data: ", JSON.stringify(params, null, 2));

//     const response = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', params, { headers });

//     console.log("Shiprocket Order Response: ", response.data);

//     if (response.data.error) {
//       console.log("Error in Shiprocket response: ", response.data.error);
//     } else {
//       console.log("Order successfully placed with Shiprocket.");
//       return response.data
//     }

//   } catch (error) {
//     console.error("Error sending order to Shiprocket:", error);
//     if (error.response) {
//       console.error("Shiprocket API Error Response: ", error.response.data);
//     }
//   }
// };








import Order from "../models/orderModel.js";
import MenuItem from "../models/menuItemModel.js";
import Table from "../models/tableModel.js";
import Variant from "../models/varianModel.js";
import crypto from "crypto";
import PDFDocument from "pdfkit";


import puppeteerCore from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { getIO } from "../socket/socket.js";


// import { io } from "../server.js";

// getIO


// export const placeOrder = async (req, res) => {
//     try {
//         const {
//             restaurant,
//             table,
//             orderType,
//             items,
//             discountAmount = 0
//         } = req.body;

//         if (!restaurant || !orderType || !items?.length) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid order data"
//             });
//         }

//         let subTotal = 0;

//         const formattedItems = [];

//         for (const cartItem of items) {
//             const dbItem = await MenuItem.findById(cartItem.itemId);

//             if (!dbItem) {
//                 return res.status(404).json({
//                     success: false,
//                     message: "Menu item not found"
//                 });
//             }

//             const basePrice = dbItem.price;

//             let itemTotal = 0;

//             const formattedVariants = cartItem.variants?.map(v => {
//                 const variantTotal = (v.price || 0) * (v.quantity || 1);
//                 itemTotal += variantTotal;

//                 return {
//                     variantId: v.variantId,
//                     name: v.name,
//                     price: v.price,
//                     quantity: v.quantity
//                 };
//             }) || [];

//             itemTotal += basePrice * cartItem.quantity;

//             subTotal += itemTotal;

//             formattedItems.push({
//                 itemId: dbItem._id,
//                 name: dbItem.name,
//                 basePrice,
//                 variants: formattedVariants,
//                 quantity: cartItem.quantity,
//                 totalPrice: itemTotal
//             });
//         }

//         const taxAmount = subTotal * 0.05; // 5% tax example
//         const grandTotal = subTotal + taxAmount - discountAmount;

//         const order = await Order.create({
//             restaurant,
//             table,
//             orderType,
//             createdBy: req.user._id,
//             items: formattedItems,
//             subTotal,
//             taxAmount,
//             discountAmount,
//             grandTotal
//         });

//         // ✅ DINE_IN me table occupied karo
//         if (orderType === "DINE_IN" && table) {
//             await Table.findByIdAndUpdate(table, { status: "occupied" });
//         }

//         res.status(201).json({
//             success: true,
//             message: "Order placed successfully",
//             order
//         });

//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };







// export const placeOrder = async (req, res) => {
//     try {
//         const {
//             restaurant,
//             table,
//             items,
//             orderType,
//             subTotal,
//             taxAmount,
//             grandTotal
//         } = req.body;

//         const existingToken = req.cookies?.orderToken;

//         if (!restaurant || !items?.length) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid order data"
//             });
//         }

//         /* ===================================================
//            🔎 FORMAT ITEMS FROM DATABASE (IMPORTANT FIX)
//         ==================================================== */

//         const formattedItems = [];

//         for (const cartItem of items) {

//             const dbItem = await MenuItem.findById(cartItem.itemId);

//             if (!dbItem) continue;

//             const formattedVariants = [];

//             if (cartItem.variants?.length) {
//                 for (const v of cartItem.variants) {

//                     const dbVariant = await Variant.findById(v.variantId);
//                     if (!dbVariant) continue;

//                     formattedVariants.push({
//                         variantId: dbVariant._id,
//                         name: dbVariant.name,
//                         price: dbVariant.price,
//                         quantity: v.quantity || 1
//                     });
//                 }
//             }

//             formattedItems.push({
//                 itemId: dbItem._id,
//                 name: dbItem.name,
//                 image: dbItem.image || [],  // ✅ IMAGE FIXED
//                 basePrice: dbItem.basePrice,
//                 quantity: cartItem.quantity || 1,
//                 variants: formattedVariants,
//                 totalPrice: cartItem.totalPrice || 0
//             });
//         }

//         /* ===================================================
//            🔁 CHECK EXISTING ORDER BY TOKEN
//         ==================================================== */

//         let order = null;

//         if (existingToken) {
//             order = await Order.findOne({
//                 orderAccessToken: existingToken,
//                 orderStatus: { $nin: ["COMPLETED", "CANCELLED"] }
//             });
//         }

//         /* ===================================================
//            🔄 UPDATE EXISTING ORDER
//         ==================================================== */


//         console.log("Bhai mere Order Kya aa rha hai", order)
//         console.log("Bhai mere formattedItems Kya aa rha hai", formattedItems)

//         if (order) {

//             for (const newItem of formattedItems) {

//                 const existingIndex = order.items.findIndex(
//                     (i) =>
//                         i.itemId.toString() === newItem.itemId.toString() &&
//                         JSON.stringify(i.variants || []) ===
//                         JSON.stringify(newItem.variants || [])
//                 );

//                 if (existingIndex > -1) {
//                     order.items[existingIndex].quantity += newItem.quantity;
//                     // order.items[existingIndex].grandTotal += grandTotal;
//                     // order.items[existingIndex].subTotal += subTotal;
//                 } else {
//                     order.items.push(newItem);
//                 }
//             }

//             order.subTotal += Number(subTotal);
//             order.taxAmount += Number(taxAmount);
//             order.grandTotal += Number(grandTotal);

//             await order.save();
//             getIO.to(`restaurant_${restaurant}`).emit("orderUpdated", order);


//             return res.status(200).json({
//                 success: true,
//                 message: "Order updated successfully",
//                 order
//             });
//         }

//         /* ===================================================
//            🆕 CREATE NEW ORDER
//         ==================================================== */

//         const lastOrder = await Order.findOne().sort({ createdAt: -1 });

//         let nextNumber = 1;

//         if (lastOrder?.orderNumber) {
//             const lastNum = parseInt(
//                 lastOrder.orderNumber.replace("#ORDER", "")
//             );
//             nextNumber = lastNum + 1;
//         }

//         const orderNumber = `#ORDER${String(nextNumber).padStart(4, "0")}`;

//         const orderAccessToken = crypto.randomBytes(32).toString("hex");

//         const newOrder = await Order.create({
//             orderNumber,
//             restaurant,
//             table: table || null,
//             orderType: orderType || "DINE_IN",
//             items: formattedItems,
//             subTotal: Number(subTotal),
//             taxAmount: Number(taxAmount),
//             grandTotal: Number(grandTotal),
//             orderAccessToken
//         });

//         if (table) {
//             await Table.findByIdAndUpdate(table, { status: "occupied" });
//         }

//         getIO.to(`restaurant_${restaurant}`).emit("newOrder", newOrder);

//         res.cookie("orderToken", orderAccessToken, {
//             sameSite: "none",
//             secure: true,

//             sameSite: "none",
//             maxAge: 1000 * 60 * 60 * 3
//         });

//         return res.status(201).json({
//             success: true,
//             message: "Order created successfully",
//             order: newOrder
//         });

//     } catch (error) {
//         console.error("Place Order Error:", error);
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };



export const placeOrder = async (req, res) => {
  try {
    const {
      restaurant,
      table,
      items,
      orderType,
      subTotal,
      taxAmount,
      grandTotal,
      customerName,
      waiterName,
      tokenBillNumber
    } = req.body;

    const existingToken = req.cookies?.orderToken;

    if (!restaurant || !items?.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid order data"
      });
    }

    const formattedItems = [];

    for (const cartItem of items) {
      const dbItem = await MenuItem.findById(cartItem.itemId);
      if (!dbItem) continue;

      const formattedVariants = [];

      if (cartItem.variants?.length) {
        for (const v of cartItem.variants) {
          const dbVariant = await Variant.findById(v.variantId);
          if (!dbVariant) continue;

          formattedVariants.push({
            variantId: dbVariant._id,
            name: dbVariant.name,
            price: dbVariant.price,
            quantity: v.quantity || 1
          });
        }
      }

      formattedItems.push({
        itemId: dbItem._id,
        name: dbItem.name,
        image: dbItem.image || [],
        basePrice: dbItem.basePrice,
        quantity: cartItem.quantity || 1,
        variants: formattedVariants,
        totalPrice: cartItem.totalPrice || 0
      });
    }

    let order = null;

    if (existingToken) {
      order = await Order.findOne({
        orderAccessToken: existingToken,
        orderStatus: { $nin: ["COMPLETED", "CANCELLED"] }
      });
    }

    const io = getIO(); // ✅ IMPORTANT

    /* ===================================================
       UPDATE EXISTING ORDER
    ==================================================== */

    if (order) {
      for (const newItem of formattedItems) {
        const existingIndex = order.items.findIndex(
          (i) =>
            i.itemId.toString() === newItem.itemId.toString() &&
            JSON.stringify(i.variants || []) ===
            JSON.stringify(newItem.variants || [])
        );

        if (existingIndex > -1) {
          order.items[existingIndex].quantity += newItem.quantity;
        } else {
          order.items.push(newItem);
        }
      }

      order.subTotal += Number(subTotal);
      order.taxAmount += Number(taxAmount);
      order.grandTotal += Number(grandTotal);

      await order.save();

      // 🔥 Emit to restaurant room
      io.to(`restaurant_${restaurant}`)
        .emit("orderUpdated", order);

      // 🔥 Emit to user room (if logged in system use)
      if (order.user) {
        io.to(`user_${order.user}`)
          .emit("orderUpdated", order);
      }

      return res.status(200).json({
        success: true,
        message: "Order updated successfully",
        order
      });
    }

    /* ===================================================
       CREATE NEW ORDER
    ==================================================== */

    const lastOrder = await Order.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastOrder?.orderNumber) {
      const lastNum = parseInt(
        lastOrder.orderNumber.replace("#ORDER", "")
      );
      nextNumber = lastNum + 1;
    }

    const orderNumber = `#ORDER${String(nextNumber).padStart(4, "0")}`;
    const orderAccessToken = crypto.randomBytes(32).toString("hex");

    // Determine order status based on tokenBillNumber
    const orderStatus = tokenBillNumber ? "COMPLETED" : "NEW";

    const newOrder = await Order.create({
      orderNumber,
      restaurant,
      table: table || null,
      orderType: orderType || "DINE_IN",
      items: formattedItems,
      subTotal: Number(subTotal),
      taxAmount: Number(taxAmount),
      grandTotal: Number(grandTotal),
      orderAccessToken,
      customerName: customerName || "Guest",
      waiterName: waiterName || "Waiter",
      orderStatus,
      tokenBillNumber: tokenBillNumber || null
    });

    // If it's a token bill order, free the table
    if (tokenBillNumber && table) {
      await Table.findByIdAndUpdate(table, { status: "free" });
    } else if (table) {
      await Table.findByIdAndUpdate(table, { status: "occupied" });
    }

    // 🔥 Emit new order to restaurant
    const roomName = `restaurant_${restaurant}`;
    console.log("🔥 Emitting newOrder to restaurant room:", roomName);
    console.log("🔥 Order data being emitted:", {
      orderId: newOrder._id,
      orderNumber: newOrder.orderNumber,
      restaurantId: restaurant,
      orderStatus: newOrder.orderStatus,
      tokenBillNumber: newOrder.tokenBillNumber
    });
    io.to(roomName).emit("newOrder", newOrder);

    res.cookie("orderToken", orderAccessToken, {
      expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
    });

    return res.status(201).json({
      success: true,
      message: tokenBillNumber ? "Token bill order completed successfully" : "Order created successfully",
      order: newOrder
    });

  } catch (error) {
    console.error("Place Order Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};



export const getOrders = async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 10,
      date,
      startDate,
      endDate
    } = req.query;

    const filter = {};

    // Automatically logged-in user ka restaurant
    filter.restaurant = req.user.restaurant;

    const statusU = status ? status.toUpperCase() : null;

    if (statusU) filter.orderStatus = statusU;

    // Add date filtering for today's orders
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1); // Next day for range

      filter.createdAt = {
        $gte: startDate,
        $lt: endDate
      };
    }

    // Add date range filtering for monthly orders
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Include the entire end date
      end.setHours(23, 59, 59, 999);

      filter.createdAt = {
        $gte: start,
        $lte: end
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(filter)
      .populate("table", "tableNumber status")
      .populate("createdBy", "name email")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments(filter);

    // Calculate total income from filtered orders
    const incomeResult = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, totalIncome: { $sum: "$grandTotal" } } }
    ]);
    const totalIncome = incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;

    return res.json({
      success: true,
      totalOrders: total,
      totalIncome: totalIncome,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      orders
    });

  } catch (error) {
    console.error("Get Orders Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};



export const updateOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      restaurant,
      table,
      items,
      orderType,
      subTotal,
      taxAmount,
      grandTotal,
      customerName,
      waiterName
    } = req.body;

    console.log("🔥 Updating order details:", { id, restaurant, table, orderType, customerName });
    console.log("🔥 Updating order details:", { items });

    // Find the existing order
    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Check if order belongs to the user's restaurant
    if (existingOrder.restaurant.toString() !== req.user.restaurant.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update orders from your restaurant"
      });
    }

    // Format items similar to placeOrder
    const formattedItems = [];

    for (const cartItem of items) {
      const dbItem = await MenuItem.findById(cartItem.itemId);
      if (!dbItem) continue;

      const formattedVariants = [];

      if (cartItem.variants?.length) {
        for (const v of cartItem.variants) {
          const dbVariant = await Variant.findById(v.variantId);
          if (!dbVariant) continue;

          formattedVariants.push({
            variantId: dbVariant._id,
            name: dbVariant.name,
            price: dbVariant.price,
            quantity: v.quantity || 1
          });
        }
      }

      formattedItems.push({
        itemId: dbItem._id,
        name: dbItem.name,
        image: dbItem.image || [],
        basePrice: dbItem.basePrice,
        quantity: cartItem.quantity || 1,
        variants: formattedVariants,
        totalPrice: cartItem.totalPrice || 0
      });
    }

    // Update order fields
    existingOrder.table = table;
    existingOrder.orderType = orderType;
    existingOrder.items = formattedItems;
    existingOrder.subTotal = Number(subTotal);
    existingOrder.taxAmount = Number(taxAmount);
    existingOrder.grandTotal = Number(grandTotal);
    existingOrder.customerName = customerName || existingOrder.customerName;
    existingOrder.waiterName = waiterName || existingOrder.waiterName;

    // Save updated order
    await existingOrder.save();

    // Populate the updated order with related data
    const updatedOrder = await Order.findById(existingOrder._id)
      .populate("table", "tableNumber status")
      .populate("createdBy", "name email")
      .populate("restaurant", "name");

    // Emit socket event for real-time updates
    const io = getIO();
    const roomName = `restaurant_${existingOrder.restaurant.toString()}`;

    console.log("🔥 Emitting orderUpdated event to room:", roomName);
    io.to(roomName).emit("orderUpdated", updatedOrder);

    return res.json({
      success: true,
      message: "Order updated successfully",
      order: updatedOrder
    });

  } catch (error) {
    console.error("Update Order Details Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const getOrderStatusCounts = async (req, res) => {
  try {
    // 🔥 Automatically logged-in user ka restaurant
    const restaurantFilter = { restaurant: req.user.restaurant };

    const statusCounts = {
      total: await Order.countDocuments(restaurantFilter),
      new: await Order.countDocuments({ ...restaurantFilter, orderStatus: "NEW" }),
      preparing: await Order.countDocuments({ ...restaurantFilter, orderStatus: "PREPARING" }),
      ready: await Order.countDocuments({ ...restaurantFilter, orderStatus: "READY" }),
      served: await Order.countDocuments({ ...restaurantFilter, orderStatus: "SERVED" }),
      completed: await Order.countDocuments({ ...restaurantFilter, orderStatus: "COMPLETED" }),
      cancelled: await Order.countDocuments({ ...restaurantFilter, orderStatus: "CANCELLED" })
    };

    return res.json({
      success: true,
      counts: statusCounts
    });

  } catch (error) {
    console.error("Get Order Status Counts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};


export const updatePreparationTime = async (req, res) => {
  try {
    const { id } = req.params;
    const { preparationTime } = req.body;
    console.log("Bhai mere body me kya kyta aa hrai", req.body)

    if (!preparationTime || preparationTime < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid preparation time"
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.preparationTime = preparationTime;
    await order.save();

    const io = getIO();

    // Emit to restaurant room (for kitchen display)
    const roomName = `restaurant_${order.restaurant.toString()}`;
    console.log("🔥 Emitting preparationTimeUpdated to restaurant room:", roomName);
    console.log("🔥 Preparation time data:", {
      orderId: order._id,
      preparationTime: preparationTime,
      restaurantId: order.restaurant.toString()
    });

    io.to(roomName).emit("preparationTimeUpdated", {
      orderId: order._id,
      preparationTime: preparationTime
    });

    // Emit to order-specific room (for customer)
    if (order.orderAccessToken) {
      const orderRoomName = `order_${order.orderAccessToken}`;
      console.log("🔥 Emitting preparationTimeUpdated to order room:", orderRoomName);
      io.to(orderRoomName).emit("preparationTimeUpdated", {
        orderId: order._id,
        preparationTime: preparationTime
      });
    }

    return res.json({
      success: true,
      message: "Preparation time updated successfully",
      order
    });

  } catch (error) {
    console.error("Update Preparation Time Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "NEW",
      "PREPARING",
      "READY",
      "SERVED",
      "COMPLETED",
      "CANCELLED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    order.orderStatus = status;
    await order.save();

    const io = getIO();

    // Emit to restaurant room (for kitchen display)
    const roomName = `restaurant_${order.restaurant.toString()}`;
    console.log(" Emitting orderUpdated to restaurant room:", roomName);
    console.log(" Order data:", {
      orderId: order._id,
      orderNumber: order.orderNumber,
      oldStatus: order.orderStatus,
      newStatus: status,
      restaurantId: order.restaurant.toString()
    });

    io.to(roomName).emit("orderUpdated", order);

    // Emit to order-specific room (for customer)
    if (order.orderAccessToken) {
      const orderRoomName = `order_${order.orderAccessToken}`;
      console.log(" Emitting orderUpdated to order room:", orderRoomName);
      io.to(orderRoomName).emit("orderUpdated", order);
    }

    // Emit to specific user (if available)
    if (order.user) {
      io.to(`user_${order.user.toString()}`)
        .emit("orderUpdated", order);
    }

    // Free table when order is COMPLETED or CANCELLED

    if (
      (status === "COMPLETED" || status === "CANCELLED") &&
      order.table
    ) {
      try {
        console.log("🔥 Freeing table:", order.table, "for order:", order.orderNumber);
        const updatedTable = await Table.findByIdAndUpdate(
          order.table,
          { status: "free" },
          { new: true }
        );
        console.log("✅ Table updated successfully:", updatedTable?.tableNumber, "status:", updatedTable?.status);
      } catch (tableError) {
        console.error("❌ Error updating table status:", tableError);
      }
    }

    return res.json({
      success: true,
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    console.error("Update Order Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const getMyOrder = async (req, res) => {
  try {
    const token = req.cookies.orderToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No order access"
      });
    }

    const order = await Order.findOne({ orderAccessToken: token })
      .populate("table").populate("restaurant", "name logo");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// controllers/invoiceController.js

// import puppeteer from "puppeteer";
// export const downloadInvoice = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const order = await Order.findById(id)
//             .populate("restaurant")
//             .populate("table");

//         console.log("Bhai mere ek baar batao  ki ORder kya tha", order)

//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         const itemsHTML = order.items.map((item, index) => {

//             const basePrice = item.basePrice;
//             const totalQuantity = item.variants?.reduce((acc, v) => {
//                 return acc + (Number(v.quantity) || 0);
//             }, 0) || 0;

//             const variantsHTML = item.variants?.map(v =>
//                 `
//         <div class="row small">
//           <div class="indent">
//             ↳ ${v.name} (x${v.quantity})
//           </div>
//           <div>
//             ₹${(v.price * v.quantity).toFixed(2)}
//           </div>
//         </div>
//       `).join("") || "";

//             return `
//         <div class="item-name">${index + 1}. ${item.name}</div>

//         <div class="row small">
//           <div>${totalQuantity ? totalQuantity : item.quantity} x ₹${basePrice.toFixed(2)}</div>
//           <div>₹${totalQuantity ? (totalQuantity * basePrice).toFixed(2) : item.totalPrice.toFixed(2)}</div>
//         </div>

//         ${variantsHTML}

//         <div class="divider"></div>
//       `;
//         }).join("");

//         const html = `
// <html>
// <head>
//   <style>
//     body {
//       font-family: monospace;
//       background: #fff;
//       margin: 0;
//       padding: 10px;
//     }

//     .invoice {
//       width: 300px;
//       margin: auto;
//       font-size: 12px;
//       color: #000;
//       line-height: 1.5;
//     }

//     .center { text-align: center; }
//     .right { text-align: right; }
//     .bold { font-weight: bold; }

//     .divider {
//       border-top: 1px dashed #000;
//       margin: 6px 0;
//     }

//     .row {
//       display: flex;
//       justify-content: space-between;
//     }

//     .item-name {
//       margin-top: 6px;
//       font-weight: bold;
//     }

//     .small {
//       font-size: 11px;
//     }

//     .total {
//       font-weight: bold;
//       font-size: 14px;
//     }

//     .indent {
//       padding-left: 10px;
//     }

//   </style>
// </head>

// <body>

// <div class="invoice">

//   <div class="center bold">
//     ${order.restaurant?.name}
//   </div>

//   <div class="center small">
//     ${order.restaurant?.address || ""}
//   </div>

//   <div class="center small">
//     GSTIN: ${order.restaurant?.gstNumber || "-"}
//   </div>

//   <div class="divider"></div>

//   <div class="center bold">TAX INVOICE</div>

//   <div class="divider"></div>

//   <div class="row">
//     <div>Invoice #:</div>
//     <div>${order.orderNumber}</div>
//   </div>

//   <div class="row">
//     <div>Date:</div>
//     <div>${new Date(order.createdAt).toLocaleDateString()}</div>
//   </div>

//   <div class="divider"></div>

//   <div class="bold">BILLED TO</div>
//   <div>${order.customer?.name || "Walk-in Customer"}</div>
//   <div class="small">${order.customer?.phone || ""}</div>

//   <div class="divider"></div>

//   ${itemsHTML}

//   <div class="bold center">SUMMARY</div>

//   <div class="divider"></div>

//   <div class="row">
//     <div>Taxable Amount</div>
//     <div>₹${order.subTotal?.toFixed(2)}</div>
//   </div>

//   <div class="row">
//     <div>Add: GST</div>
//     <div>₹${order.taxAmount?.toFixed(2) || "0.00"}</div>
//   </div>

//   <div class="divider"></div>

//   <div class="row total">
//     <div>Grand Total</div>
//     <div>₹${order.grandTotal?.toFixed(2)}</div>
//   </div>

//   <div class="divider"></div>

//   <div class="center small">
//     Thank You For Your Business<br/>
//     Visit Again 🙏
//   </div>

// </div>

// </body>
// </html>
// `;

//         // const browser = await puppeteer.launch();
//        const browser = await puppeteer.launch({
//     headless: true,
//     args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--single-process"
//     ]
// });
//         const page = await browser.newPage();

//         await page.setContent(html, { waitUntil: "domcontentloaded" });

//         const pdf = await page.pdf({
//             width: "80mm",
//             printBackground: true
//         });

//         await browser.close();

//         res.set({
//             "Content-Type": "application/pdf",
//             "Content-Disposition": `attachment; filename=Invoice-${order.orderNumber}.pdf`
//         });

//         res.send(pdf);

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Invoice generation failed" });
//     }
// };


// export const downloadInvoice = async (req, res) => {
//   let browser;

//   try {
//     const { id } = req.params;

//     const order = await Order.findById(id)
//       .populate("restaurant")
//       .populate("table");

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // ===== SAFE ITEM HTML =====
//     const itemsHTML = order.items.map((item, index) => {

//       const basePrice = Number(item.basePrice) || 0;

//       const totalQuantity =
//         item.variants?.reduce((acc, v) => {
//           return acc + (Number(v.quantity) || 0);
//         }, 0) || Number(item.quantity) || 0;

//       const variantsHTML =
//         item.variants?.map(v => `
//           <div class="row small">
//             <div class="indent">
//               ↳ ${v.name} (x${v.quantity})
//             </div>
//             <div>
//               ₹${(Number(v.price || 0) * Number(v.quantity || 0)).toFixed(2)}
//             </div>
//           </div>
//         `).join("") || "";

//       const itemTotal =
//         totalQuantity > 0
//           ? totalQuantity * basePrice
//           : Number(item.totalPrice) || 0;

//       return `
//         <div class="item-name">${index + 1}. ${item.name}</div>

//         <div class="row small">
//           <div>${totalQuantity} x ₹${basePrice.toFixed(2)}</div>
//           <div>₹${itemTotal.toFixed(2)}</div>
//         </div>

//         ${variantsHTML}
//         <div class="divider"></div>
//       `;
//     }).join("");

//     // ===== HTML TEMPLATE =====
//     const html = `
//     <html>
//     <head>
//       <style>
//         body {
//           font-family: monospace;
//           background: #fff;
//           margin: 0;
//           padding: 10px;
//         }

//         .invoice {
//           width: 280px;
//           margin: auto;
//           font-size: 12px;
//           color: #000;
//           line-height: 1.5;
//         }

//         .center { text-align: center; }
//         .bold { font-weight: bold; }

//         .divider {
//           border-top: 1px dashed #000;
//           margin: 6px 0;
//         }

//         .row {
//           display: flex;
//           justify-content: space-between;
//         }

//         .item-name {
//           margin-top: 6px;
//           font-weight: bold;
//         }

//         .small { font-size: 11px; }
//         .total {
//           font-weight: bold;
//           font-size: 14px;
//         }

//         .indent { padding-left: 10px; }
//       </style>
//     </head>

//     <body>
//       <div class="invoice">

//         <div class="center bold">
//           ${order.restaurant?.name || ""}
//         </div>

//         <div class="center small">
//           ${order.restaurant?.address || ""}
//         </div>

//         <div class="center small">
//           GSTIN: ${order.restaurant?.gstNumber || "-"}
//         </div>

//         <div class="divider"></div>

//         <div class="center bold">TAX INVOICE</div>

//         <div class="divider"></div>

//         <div class="row">
//           <div>Invoice #:</div>
//           <div>${order.orderNumber}</div>
//         </div>

//         <div class="row">
//           <div>Date:</div>
//           <div>${new Date(order.createdAt).toLocaleDateString()}</div>
//         </div>

//         <div class="divider"></div>

//         <div class="bold">BILLED TO</div>
//         <div>${order.customer?.name || "Walk-in Customer"}</div>
//         <div class="small">${order.customer?.phone || ""}</div>

//         <div class="divider"></div>

//         ${itemsHTML}

//         <div class="bold center">SUMMARY</div>

//         <div class="divider"></div>

//         <div class="row">
//           <div>Taxable Amount</div>
//           <div>₹${Number(order.subTotal || 0).toFixed(2)}</div>
//         </div>

//         <div class="row">
//           <div>Add: GST</div>
//           <div>₹${Number(order.taxAmount || 0).toFixed(2)}</div>
//         </div>

//         <div class="divider"></div>

//         <div class="row total">
//           <div>Grand Total</div>
//           <div>₹${Number(order.grandTotal || 0).toFixed(2)}</div>
//         </div>

//         <div class="divider"></div>

//         <div class="center small">
//           Thank You For Your Business<br/>
//           Visit Again 🙏
//         </div>

//       </div>
//     </body>
//     </html>
//     `;

//     // ===== LAUNCH BROWSER (WINDOWS SAFE) =====
//     browser = await puppeteer.launch({
//       headless: "new"
//     });

//     const page = await browser.newPage();

//     await page.setContent(html, { waitUntil: "networkidle0" });

//     const pdf = await page.pdf({
//       width: "80mm",
//       printBackground: true,
//       margin: {
//         top: "5mm",
//         bottom: "5mm",
//         left: "5mm",
//         right: "5mm"
//       }
//     });

//     await browser.close();

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename=Invoice-${order.orderNumber}.pdf`
//     });

//     return res.send(pdf);

//   } catch (error) {
//     console.error("PDF ERROR:", error);

//     if (browser) {
//       await browser.close();
//     }

//     return res.status(500).json({
//       message: "Invoice generation failed"
//     });
//   }
// };

// export const downloadInvoice = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const order = await Order.findById(id)
//             .populate("restaurant")
//             .populate("table");

//         console.log("Bhai mere ek baar batao  ki ORder kya tha", order)

//         if (!order) {
//             return res.status(404).json({ message: "Order not found" });
//         }

//         const itemsHTML = order.items.map((item, index) => {

//             const basePrice = item.basePrice;
//             const totalQuantity = item.variants?.reduce((acc, v) => {
//                 return acc + (Number(v.quantity) || 0);
//             }, 0) || 0;

//             const variantsHTML = item.variants?.map(v =>
//                 `
//         <div class="row small">
//           <div class="indent">
//             ↳ ${v.name} (x${v.quantity})
//           </div>
//           <div>
//             ₹${(v.price * v.quantity).toFixed(2)}
//           </div>
//         </div>
//       `).join("") || "";

//             return `
//         <div class="item-name">${index + 1}. ${item.name}</div>

//         <div class="row small">
//           <div>${ totalQuantity?totalQuantity:item.quantity} x ₹${basePrice.toFixed(2)}</div>
//           <div>₹${totalQuantity?(totalQuantity*basePrice).toFixed(2):item.totalPrice.toFixed(2) }</div>
//         </div>

//         ${variantsHTML}

//         <div class="divider"></div>
//       `;
//         }).join("");

//         const html = `
// <html>
// <head>
//   <style>
//     body {
//       font-family: monospace;
//       background: #fff;
//       margin: 0;
//       padding: 10px;
//     }

//     .invoice {
//       width: 300px;
//       margin: auto;
//       font-size: 12px;
//       color: #000;
//       line-height: 1.5;
//     }

//     .center { text-align: center; }
//     .right { text-align: right; }
//     .bold { font-weight: bold; }

//     .divider {
//       border-top: 1px dashed #000;
//       margin: 6px 0;
//     }

//     .row {
//       display: flex;
//       justify-content: space-between;
//     }

//     .item-name {
//       margin-top: 6px;
//       font-weight: bold;
//     }

//     .small {
//       font-size: 11px;
//     }

//     .total {
//       font-weight: bold;
//       font-size: 14px;
//     }

//     .indent {
//       padding-left: 10px;
//     }

//   </style>
// </head>

// <body>

// <div class="invoice">

//   <div class="center bold">
//     ${order.restaurant?.name}
//   </div>

//   <div class="center small">
//     ${order.restaurant?.address || ""}
//   </div>

//   <div class="center small">
//     GSTIN: ${order.restaurant?.gstNumber || "-"}
//   </div>

//   <div class="divider"></div>

//   <div class="center bold">TAX INVOICE</div>

//   <div class="divider"></div>

//   <div class="row">
//     <div>Invoice #:</div>
//     <div>${order.orderNumber}</div>
//   </div>

//   <div class="row">
//     <div>Date:</div>
//     <div>${new Date(order.createdAt).toLocaleDateString()}</div>
//   </div>

//   <div class="divider"></div>

//   <div class="bold">BILLED TO</div>
//   <div>${order.customer?.name || "Walk-in Customer"}</div>
//   <div class="small">${order.customer?.phone || ""}</div>

//   <div class="divider"></div>

//   ${itemsHTML}

//   <div class="bold center">SUMMARY</div>

//   <div class="divider"></div>

//   <div class="row">
//     <div>Taxable Amount</div>
//     <div>₹${order.subTotal?.toFixed(2)}</div>
//   </div>

//   <div class="row">
//     <div>Add: GST</div>
//     <div>₹${order.taxAmount?.toFixed(2) || "0.00"}</div>
//   </div>

//   <div class="divider"></div>

//   <div class="row total">
//     <div>Grand Total</div>
//     <div>₹${order.grandTotal?.toFixed(2)}</div>
//   </div>

//   <div class="divider"></div>

//   <div class="center small">
//     Thank You For Your Business<br/>
//     Visit Again 🙏
//   </div>

// </div>

// </body>
// </html>
// `;

//         // const browser = await puppeteer.launch();
//    const browser = await puppeteer.launch({
//     headless: true,
//     args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//         "--disable-dev-shm-usage",
//         "--single-process"
//     ]
// });
//         const page = await browser.newPage();

//         await page.setContent(html, { waitUntil: "domcontentloaded" });

//         const pdf = await page.pdf({
//             width: "80mm",
//             printBackground: true
//         });

//         await browser.close();

//         res.set({
//             "Content-Type": "application/pdf",
//             "Content-Disposition": `attachment; filename=Invoice-${order.orderNumber}.pdf`
//         });

//         res.send(pdf);

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Invoice generation failed" });
//     }
// };


// export const downloadInvoice = async (req, res) => {
//   let browser;

//   try {
//     const { id } = req.params;

//     const order = await Order.findById(id)
//       .populate("restaurant")
//       .populate("table");

//       console.log("Bhai mere Order Kya hai Tera ",order)

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // ================= ITEM HTML =================
//     const itemsHTML = order.items.map((item, index) => {

//       const basePrice = Number(item.basePrice) || 0;

//       const totalQuantity =
//         item.variants?.reduce((acc, v) => acc + (Number(v.quantity) || 0), 0)
//         || Number(item.quantity) || 0;

//       const variantsHTML =
//         item.variants?.map(v => `
//           <div class="row small">
//             <div class="indent">
//               ↳ ${v.name} (x${v.quantity})
//             </div>
//             <div>
//               ₹${(Number(v.price || 0) * Number(v.quantity || 0)).toFixed(2)}
//             </div>
//           </div>
//         `).join("") || "";

//       const itemTotal =
//         totalQuantity > 0
//           ? totalQuantity * basePrice
//           : Number(item.totalPrice) || 0;

//       return `
//         <div class="item-name">${index + 1}. ${item.name}</div>

//         <div class="row small">
//           <div>${totalQuantity} x ₹${basePrice.toFixed(2)}</div>
//           <div>₹${item.variants.length > 0 ? basePrice : itemTotal.toFixed(2)}</div>
//         </div>

//         ${variantsHTML}
//         <div class="divider"></div>
//       `;
//     }).join("");

//     // ================= HTML TEMPLATE =================
//     const html = `<!DOCTYPE html>
//     <html>
//     <head>
//       <meta charset="UTF-8" />
//       <style>
//         body { font-family: monospace; margin:0; padding:10px; }
//         .invoice { width:280px; margin:auto; font-size:12px; }
//         .center { text-align:center; }
//         .bold { font-weight:bold; }
//         .divider { border-top:1px dashed #000; margin:6px 0; }
//         .row { display:flex; justify-content:space-between; }
//         .item-name { margin-top:6px; font-weight:bold; }
//         .small { font-size:11px; }
//         .total { font-weight:bold; font-size:14px; }
//         .indent { padding-left:10px; }
//       </style>
//     </head>
//     <body>
//       <div class="invoice">

//         <div class="center bold">
//           ${order.restaurant?.name || ""}
//         </div>

//         <div class="center small">
//         Address:
//           ${order.restaurant?.address.line1 || ""}, ${order.restaurant?.address.city || ""} - ${order.restaurant?.address.state || ""}, ${order.restaurant?.address.pincode || ""}
//         </div>

//         <div class="center small">
//           GSTIN: ${order.restaurant?.gstNumber || "-"}
//         </div>

//         <div class="divider"></div>
//         <div class="center bold">TAX INVOICE</div>
//         <div class="divider"></div>

//         <div class="row">
//           <div>Invoice #:</div>
//           <div>${order.orderNumber}</div>
//         </div>
//         ${order.tokenBillNumber ? `
//         <div class="row">
//           <div>Token #:</div>
//           <div>${order.tokenBillNumber}</div>
//         </div>` : ""}


//         <div class="row">
//           <div>Date:</div>
//           <div>${new Date(order.createdAt).toLocaleDateString()}</div>
//         </div>

//         <div class="divider"></div>

//         <div class="bold">BILLED TO</div>
//         <div>${order.orderType || order.customerName || "Walk-in Customer"}</div>
//         <div class="small">${order.customer?.phone || ""}</div>

//         <div class="divider"></div>

//         ${itemsHTML}

//         <div class="bold center">SUMMARY</div>
//         <div class="divider"></div>

//         <div class="row">
//           <div>Taxable Amount</div>
//           <div>₹${Number(order.subTotal || 0).toFixed(2)}</div>
//         </div>

//         <div class="row">
//           <div>Add: GST</div>
//           <div>₹${Number(order.taxAmount || 0).toFixed(2)}</div>
//         </div>

//         <div class="divider"></div>

//         <div class="row total">
//           <div>Grand Total</div>
//           <div>₹${Number(order.grandTotal || 0).toFixed(2)}</div>
//         </div>

//         <div class="divider"></div>

//         <div class="center small">
//            Thank you for choosing us.<br/>
//   It was our pleasure to serve you.<br/>
//   We look forward to welcoming you again 🙏
//         </div>
//          <div class="center small">
//           <h3>Easy to Pay Your Bill</h3>
//           ${order.restaurant?.qrCodeForPayment ? `<img src="../my-app/public/assets/images/categories/${order.restaurant.qrCodeForPayment}" alt="QR Code" width="100" height="100" />` : ""}
//         </div>

//       </div>
//     </body>
//     </html>`;

//     // ================= BROWSER LAUNCH (AUTO DETECT ENV) =================
//     if (process.env.NODE_ENV === "production") {
//       //   const chromium = (await import("@sparticuz/chromium")).default;
//       //   const puppeteerCore = (await import("puppeteer-core")).default;

//       browser = await puppeteerCore.launch({
//         args: chromium.args,
//         executablePath: await chromium.executablePath(),
//         headless: chromium.headless,
//         defaultViewport: chromium.defaultViewport,
//       });

//     } else {
//       const puppeteer = (await import("puppeteer")).default;

//       browser = await puppeteer.launch({
//         headless: "new",
//       });
//     }

//     const page = await browser.newPage();

//     // Enable console logging from page context
//     page.on('console', msg => console.log('PAGE LOG:', msg.text()));
//     page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

//     // Set content and wait for all resources (including images) to load
//     await page.setContent(html, { waitUntil: "networkidle0" });

//     // Debug: Check if QR code path exists in the HTML
//     const qrCodePath = order.restaurant?.qrCodeForPayment;
//     console.log('QR Code Path:', qrCodePath);
//     console.log('Full Image Path:', `../my-app/public/assets/images/categories/${qrCodePath}`);

//     // Check if image element exists in the page
//     const hasImage = await page.evaluate(() => {
//       const img = document.querySelector('img[alt="QR Code"]');
//       return !!img;
//     });
//     console.log('Image element exists:', hasImage);

//     // Check if image file actually exists on filesystem
//     const fs = await import('fs');
//     const path = await import('path');
//     const imagePath = path.join(process.cwd(), 'my-app', 'public', 'assets', 'images', 'categories', qrCodePath);
//     const imageExists = fs.existsSync(imagePath);
//     console.log('Image file exists at path:', imagePath, imageExists);

//     // If image doesn't exist in categories, check qrcodes folder
//     let finalImagePath = imagePath;
//     if (!imageExists && qrCodePath) {
//       const qrCodePathFull = path.join(process.cwd(), 'my-app', 'public', 'assets', 'images', 'qrcodes', qrCodePath);
//       const qrCodeExists = fs.existsSync(qrCodePathFull);
//       console.log('QR Code file exists at path:', qrCodePathFull, qrCodeExists);

//       if (qrCodeExists) {
//         finalImagePath = qrCodePathFull;
//         console.log('Using QR Code folder instead of categories');
//       }
//     }

//     // Wait for images to load specifically
//     await page.waitForSelector('img', { timeout: 5000 }).catch(() => {
//       console.log('No images found or images failed to load');
//     });

//     // Additional wait for QR code image if present
//     if (order.restaurant?.qrCodeForPayment) {
//       await page.waitForFunction(() => {
//         const img = document.querySelector('img[alt="QR Code"]');
//         return img && img.complete && img.naturalHeight !== 0;
//       }, { timeout: 3000 }).catch(() => {
//         console.log('QR Code image failed to load');
//       });
//     }

//     const pdf = await page.pdf({
//       width: "80mm",
//       printBackground: true,
//       margin: {
//         top: "5mm",
//         bottom: "5mm",
//         left: "5mm",
//         right: "5mm",
//       },
//     });

//     await browser.close();

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename=Invoice-${order.orderNumber}.pdf`,
//     });

//     return res.send(pdf);

//   } catch (error) {
//     console.error("PDF ERROR:", error);
//     if (browser) await browser.close();
//     return res.status(500).json({ message: "Invoice generation failed" });
//   }
// };

// import fs from "fs";
// import path from "path";

export const downloadInvoice = async (req, res) => {
  let browser;

  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("restaurant")
      .populate("table");

    console.log("Bhai mere Order Kya hai Tera ", order)

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ================= QR CODE BASE64 CONVERSION =================
    const getBase64Image = (filePath) => {
      try {
        const image = fs.readFileSync(filePath);
        return `data:image/png;base64,${image.toString("base64")}`;
      } catch (err) {
        console.log("Image read error:", err);
        return null;
      }
    };

    const qrFileName = order.restaurant?.qrCodeForPayment;
    let qrBase64 = "";

    if (qrFileName) {
      const imagePath = path.join(
        process.cwd(),
        "../",
        "my-app",
        "public",
        "assets",
        "images",
        "categories",
        qrFileName
      );

      console.log("QR Path:", imagePath);

      qrBase64 = getBase64Image(imagePath);
    }

    // ================= ITEM HTML =================
    const itemsHTML = order.items.map((item, index) => {

      const basePrice = Number(item.basePrice) || 0;

      const totalQuantity =
        item.variants?.reduce((acc, v) => acc + (Number(v.quantity) || 0), 0)
        || Number(item.quantity) || 0;

      const variantsHTML =
        item.variants?.map(v => `
          <div class="row small">
            <div class="indent">
              ↳ ${v.name} (x${v.quantity})
            </div>
            <div>
              ₹${(Number(v.price || 0) * Number(v.quantity || 0)).toFixed(2)}
            </div>
          </div>
        `).join("") || "";

      const itemTotal =
        totalQuantity > 0
          ? totalQuantity * basePrice
          : Number(item.totalPrice) || 0;

      return `
        <div class="item-name">${index + 1}. ${item.name}</div>

        <div class="row small">
          <div>${totalQuantity} x ₹${basePrice.toFixed(2)}</div>
          <div>₹${item.variants.length > 0 ? basePrice : itemTotal.toFixed(2)}</div>
        </div>

        ${variantsHTML}
        <div class="divider"></div>
      `;
    }).join("");

    // ================= HTML TEMPLATE =================
    const html = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: monospace; margin:0; padding:10px; }
        .invoice { width:280px; margin:auto; font-size:12px; }
        .center { text-align:center; }
        .bold { font-weight:bold; }
        .divider { border-top:1px dashed #000; margin:6px 0; }
        .row { display:flex; justify-content:space-between; }
        .item-name { margin-top:6px; font-weight:bold; }
        .small { font-size:11px; }
        .total { font-weight:bold; font-size:14px; }
        .indent { padding-left:10px; }
      </style>
    </head>
    <body>
      <div class="invoice">

        <div class="center bold">
          ${order.restaurant?.name || ""}
        </div>

        <div class="center small">
        Address:
          ${order.restaurant?.address.line1 || ""}, ${order.restaurant?.address.city || ""} - ${order.restaurant?.address.state || ""}, ${order.restaurant?.address.pincode || ""}
        </div>

        <div class="center small">
          GSTIN: ${order.restaurant?.gstNumber || "-"}
        </div>

        <div class="divider"></div>
        <div class="center bold">TAX INVOICE</div>
        <div class="divider"></div>

        <div class="row">
          <div>Invoice #:</div>
          <div>${order.orderNumber}</div>
        </div>
        ${order.tokenBillNumber ? `
        <div class="row">
          <div>Token #:</div>
          <div>${order.tokenBillNumber}</div>
        </div>` : ""}


        <div class="row">
          <div>Date:</div>
          <div>${new Date(order.createdAt).toLocaleDateString()}</div>
        </div>

        <div class="divider"></div>

        <div class="bold">BILLED TO</div>
        <div>${order.orderType || order.customerName || "Walk-in Customer"}</div>
        <div class="small">${order.customer?.phone || ""}</div>

        <div class="divider"></div>

        ${itemsHTML}

        <div class="bold center">SUMMARY</div>
        <div class="divider"></div>

        <div class="row">
          <div>Taxable Amount</div>
          <div>₹${Number(order.subTotal || 0).toFixed(2)}</div>
        </div>

        <div class="row">
          <div>Add: GST</div>
          <div>₹${Number(order.taxAmount || 0).toFixed(2)}</div>
        </div>

        <div class="divider"></div>

        <div class="row total">
          <div>Grand Total</div>
          <div>₹${Number(order.grandTotal || 0).toFixed(2)}</div>
        </div>

        <div class="divider"></div>

        <div class="center small">
        ${qrBase64
        ? `<img src="${qrBase64}" width="100" height="100" />`
        : ""
      }
        <h3>Easy to Pay Your Bill</h3>
      </div>
              <div class="divider"></div>

      <div class="center small">
         Thank you for choosing us.<br/>
It was our pleasure to serve you.<br/>
We look forward to welcoming you again 🙏
      </div>
      </div>
    </body>
    </html>`;

    // ================= BROWSER LAUNCH (AUTO DETECT ENV) =================
    if (process.env.NODE_ENV === "production") {
      //   const chromium = (await import("@sparticuz/chromium")).default;
      //   const puppeteerCore = (await import("puppeteer-core")).default;

      browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      });

    } else {
      const puppeteer = (await import("puppeteer")).default;

      browser = await puppeteer.launch({
        headless: "new",
      });
    }

    const page = await browser.newPage();

    // Enable console logging from page context
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    // Set content and wait for all resources (including images) to load
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Debug: Check if QR code path exists in the HTML
    const qrCodePath = order.restaurant?.qrCodeForPayment;
    console.log('QR Code Path:', qrCodePath);
    console.log('Full Image Path:', `../my-app/public/assets/images/categories/${qrCodePath}`);

    // Check if image element exists in page
    const hasImage = await page.evaluate(() => {
      const img = document.querySelector('img[alt="QR Code"]');
      return !!img;
    });
    console.log('Image element exists:', hasImage);

    // Check if image file actually exists on filesystem
    // Try different filename variations
    let fileName = order.restaurant?.qrCodeForPayment;
    console.log('Original QR Code Path:', fileName);

    // Remove extension if exists
    if (fileName && fileName.includes('.')) {
      fileName = fileName.split('.')[0];
    }

    const imagePathCheck = path.join(process.cwd(), 'my-app', 'public', 'assets', 'images', 'categories', fileName);
    const imageExists = fs.existsSync(imagePathCheck);
    console.log('Image file exists at path:', imagePathCheck, imageExists);

    // If image doesn't exist in categories, check qrcodes folder
    let finalImagePath = imagePathCheck;
    if (!imageExists && fileName) {
      const qrCodePathFull = path.join(process.cwd(), 'my-app', 'public', 'assets', 'images', 'qrcodes', fileName);
      const qrCodeExists = fs.existsSync(qrCodePathFull);
      console.log('QR Code file exists at path:', qrCodePathFull, qrCodeExists);

      if (qrCodeExists) {
        finalImagePath = qrCodePathFull;
        console.log('Using QR Code folder instead of categories');
      }
    }

    // If still not found, try with original path
    if (!fs.existsSync(finalImagePath) && order.restaurant?.qrCodeForPayment) {
      const originalPath = path.join(process.cwd(), 'my-app', 'public', 'assets', 'images', 'categories', order.restaurant.qrCodeForPayment);
      if (fs.existsSync(originalPath)) {
        finalImagePath = originalPath;
        console.log('Using original path with extension');
      }
    }

    console.log('Final image path:', finalImagePath);

    // Wait for images to load specifically
    await page.waitForSelector('img', { timeout: 5000 }).catch(() => {
      console.log('No images found or images failed to load');
    });

    // Additional wait for QR code image if present
    if (order.restaurant?.qrCodeForPayment) {
      await page.waitForFunction(() => {
        const img = document.querySelector('img[alt="QR Code"]');
        return img && img.complete && img.naturalHeight !== 0;
      }, { timeout: 3000 }).catch(() => {
        console.log('QR Code image failed to load');
      });
    }

    const pdf = await page.pdf({
      width: "80mm",
      printBackground: true,
      margin: {
        top: "5mm",
        bottom: "5mm",
        left: "5mm",
        right: "5mm",
      },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=Invoice-${order.orderNumber}.pdf`,
    });

    return res.send(pdf);

  } catch (error) {
    console.error("PDF ERROR:", error);
    if (browser) await browser.close();
    return res.status(500).json({ message: "Invoice generation failed" });
  }
};
