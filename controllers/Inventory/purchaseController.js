import mongoose from "mongoose";

import Purchase from "../../models/Inventory/Purchase.js";
import SupplierItem from "../../models/Inventory/SupplierItem.js";
import RawMaterial from "../../models/Inventory/RawMaterial.js";
import InventoryTransaction from "../../models/Inventory/InventoryTransaction.js";

// export const createPurchase = async (req, res) => {

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {

//     const { 
//       supplier, 
//       items, 
//       isActive, 
//       purchaseNumber, 
//       status, 
//       paymentStatus, 
//       dueDate, 
//       notes,
//       purchaseDate,
//       supplierInvoiceNumber,
//       paidAmount,
//       subTotal,
//       totalTax,
//       totalDiscount,
//       totalAmount,
//       orderedAt,
//       receivedAt
//     } = req.body;
//     const restaurantId = req.user.restaurant || req.body.restaurant;
//     const createdBy = req.user?._id;
    
//     if (!restaurantId) {
//       throw new Error("Restaurant ID is required");
//     }
    
//     if (!supplier || !items?.length) {
//       throw new Error("Invalid purchase data");
//     }

//     // Validate items
//     for (let i = 0; i < items.length; i++) {
//       const item = items[i];
//       if (!item.rawMaterial || item.rawMaterial === '') {
//         throw new Error(`Raw material is required for item ${i + 1}`);
//       }
//       if (!item.quantity || item.quantity <= 0) {
//         throw new Error(`Valid quantity is required for item ${i + 1}`);
//       }
//       if (!item.pricePerUnit || item.pricePerUnit <= 0) {
//         throw new Error(`Valid price is required for item ${i + 1}`);
//       }
//     }

//     // Generate unique purchase number if not provided
//     let finalPurchaseNumber = purchaseNumber;
//     if (!finalPurchaseNumber) {
//       const lastPurchase = await Purchase.findOne({ restaurant: restaurantId })
//         .sort({ createdAt: -1 })
//         .select('purchaseNumber');
      
//       if (lastPurchase && lastPurchase.purchaseNumber) {
//         const lastNum = parseInt(lastPurchase.purchaseNumber.replace('PUR', ''));
//         finalPurchaseNumber = `PUR${String(lastNum + 1).padStart(4, '0')}`;
//       } else {
//         finalPurchaseNumber = 'PUR0001';
//       }
//     }

//     // Calculate totals if not provided
//     let calculatedSubTotal = 0;
//     let calculatedTotalTax = 0;
//     let calculatedTotalDiscount = 0;
//     let calculatedTotalAmount = 0;

//     for (let item of items) {
//       const itemTotal = item.quantity * item.pricePerUnit;
//       const taxAmount = itemTotal * (item.taxPercent || 0) / 100;
//       const discountAmount = itemTotal * (item.discount || 0) / 100;
//       const finalItemTotal = itemTotal + taxAmount - discountAmount;
      
//       calculatedSubTotal += itemTotal;
//       calculatedTotalTax += taxAmount;
//       calculatedTotalDiscount += discountAmount;
//       calculatedTotalAmount += finalItemTotal;
      
//       item.total = finalItemTotal;
//     }

//     // Determine status timestamps
//     let computedOrderedAt = orderedAt;
//     let computedReceivedAt = receivedAt;
//     const entryStatus = status || 'draft';
//     if (entryStatus === 'ordered' && !computedOrderedAt) {
//       computedOrderedAt = new Date();
//     }
//     if ((entryStatus === 'received' || entryStatus === 'partially_received') && !computedReceivedAt) {
//       computedReceivedAt = new Date();
//     }

//     const purchase = await Purchase.create([{
//       restaurant: restaurantId,
//       supplier,
//       purchaseNumber: finalPurchaseNumber,
//       purchaseDate: purchaseDate || new Date(),
//       supplierInvoiceNumber,
//       dueDate,
//       items,
//       subTotal: subTotal || calculatedSubTotal,
//       totalTax: totalTax || calculatedTotalTax,
//       totalDiscount: totalDiscount || calculatedTotalDiscount,
//       totalAmount: totalAmount || calculatedTotalAmount,
//       paidAmount: paidAmount || 0,
//       balanceAmount: (totalAmount || calculatedTotalAmount) - (paidAmount || 0),
//       status: entryStatus,
//       paymentStatus: paymentStatus || 'pending',
//       notes: notes,
//       isActive: isActive !== undefined ? isActive : true,
//       orderedAt: computedOrderedAt,
//       receivedAt: computedReceivedAt,
//       createdBy
//     }], { session });

//     // STOCK IN + UPDATE AVG COST
//     for (let item of items) {

//       // 1️⃣ Inventory Transaction
//       await InventoryTransaction.create([{
//         restaurant: restaurantId,
//         rawMaterial: item.rawMaterial,
//         type: "PURCHASE",
//         quantity: item.quantity,
//         unit: "purchase",
//         referenceId: purchase[0]._id,
//         referenceModel: "Purchase",
//         createdBy: req.user?._id
//       }], { session });

//       // 2️⃣ Update SupplierItem last price
//       await SupplierItem.findOneAndUpdate(
//         { restaurant: restaurantId, supplier, rawMaterial: item.rawMaterial },
//         { lastPurchasePrice: item.pricePerUnit },
//         { upsert: true, new: true, session }
//       );

//       // 3️⃣ Update Average Cost (Weighted)
//       const material = await RawMaterial.findById(item.rawMaterial).session(session);

//       // Get current stock before this purchase
//       const currentStock = await InventoryTransaction.aggregate([
//         { $match: { rawMaterial: material._id, restaurant: restaurantId, type: "PURCHASE" } },
//         {
//           $group: {
//             _id: "$rawMaterial",
//             totalQty: { $sum: "$quantity" }
//           }
//         }
//       ]).session(session);

//       const existingQty = currentStock.length ? currentStock[0].totalQty : 0;
      
//       // Calculate new weighted average cost
//       // Formula: (oldAvg * oldQty + newPrice * newQty) / (oldQty + newQty)
//       const newAvgCost = existingQty > 0 
//         ? ((material.averageCost * existingQty) + (item.quantity * item.pricePerUnit)) / (existingQty + item.quantity)
//         : item.pricePerUnit; // First purchase, use current price

//       material.averageCost = newAvgCost;
//       await material.save({ session });
//     }

//     await session.commitTransaction();
//     session.endSession();

//     // Populate created purchase for frontend
//     await purchase[0].populate("supplier", "name phone");
//     await purchase[0].populate({
//       path: "items.rawMaterial",
//       select: "name purchaseUnit consumptionUnit averageCost"
//     });

//     res.status(201).json({
//       success: true,
//       message: "Purchase created successfully",
//       data: purchase[0]
//     });

//   } catch (error) {

//     await session.abortTransaction();
//     session.endSession();

//     console.error("Error creating purchase:", error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


// import mongoose from "mongoose";
// import Purchase from "../../models/Inventory/Purchase.js";
// import SupplierItem from "../../models/Inventory/SupplierItem.js";
// import RawMaterial from "../../models/Inventory/RawMaterial.js";
// import InventoryTransaction from "../../models/Inventory/InventoryTransaction.js";

// export const createPurchase = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const {
//       supplier,
//       items,
//       status,
//       purchaseDate,
//       supplierInvoiceNumber,
//       paidAmount = 0,
//       dueDate,
//       notes
//     } = req.body;

//     const restaurantId = req.user.restaurant;
//     const createdBy = req.user._id;

//     if (!supplier || !items?.length) {
//       throw new Error("Supplier and items are required");
//     }

//     // 🔹 Generate Purchase Number
//     const lastPurchase = await Purchase.findOne({ restaurant: restaurantId })
//       .sort({ createdAt: -1 });

//     let purchaseNumber = "PUR0001";
//     if (lastPurchase?.purchaseNumber) {
//       const lastNum = parseInt(lastPurchase.purchaseNumber.replace("PUR", ""));
//       purchaseNumber = `PUR${String(lastNum + 1).padStart(4, "0")}`;
//     }

//     // 🔹 Calculate totals
//     let subTotal = 0, totalTax = 0, totalDiscount = 0, totalAmount = 0;

//     items.forEach(item => {
//       const line = item.quantity * item.pricePerUnit;
//       const tax = line * ((item.taxPercent || 0) / 100);
//       const discount = line * ((item.discount || 0) / 100);
//       const total = line + tax - discount;

//       item.total = total;

//       subTotal += line;
//       totalTax += tax;
//       totalDiscount += discount;
//       totalAmount += total;
//     });

//     const purchase = await Purchase.create([{
//       restaurant: restaurantId,
//       supplier,
//       purchaseNumber,
//       purchaseDate: purchaseDate || new Date(),
//       supplierInvoiceNumber,
//       items,
//       subTotal,
//       totalTax,
//       totalDiscount,
//       totalAmount,
//       paidAmount,
//       balanceAmount: totalAmount - paidAmount,
//       status: status || "draft",
//       paymentStatus: paidAmount >= totalAmount ? "paid" : "pending",
//       dueDate,
//       notes,
//       createdBy
//     }], { session });

//     // 🔥 STOCK UPDATE – always add transaction and adjust material
//     for (let item of items) {
//       await InventoryTransaction.create([{
//         restaurant: restaurantId,
//         rawMaterial: item.rawMaterial,
//         type: "PURCHASE",
//         quantity: item.quantity,
//         referenceId: purchase[0]._id,
//         referenceModel: "Purchase",
//         createdBy
//       }], { session });

//       const material = await RawMaterial.findById(item.rawMaterial).session(session);

//       const oldQty = material.currentStock || 0;
//       const oldAvg = material.averageCost || 0;
//       const newQty = item.quantity;

//       const newAvg =
//         oldQty > 0
//           ? ((oldAvg * oldQty) + (newQty * item.pricePerUnit)) / (oldQty + newQty)
//           : item.pricePerUnit;

//       material.currentStock = oldQty + newQty;
//       material.averageCost = newAvg;

//       await material.save({ session });

//       await SupplierItem.findOneAndUpdate(
//         { restaurant: restaurantId, supplier, rawMaterial: item.rawMaterial },
//         { lastPurchasePrice: item.pricePerUnit },
//         { upsert: true, session }
//       );
//     }

//     await session.commitTransaction();
//     session.endSession();

//     res.status(201).json({
//       success: true,
//       message: "Purchase created successfully",
//       data: purchase[0]
//     });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ success: false, message: error.message });
//   }
// };


export const createPurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      supplier,
      items,
      status = "draft",
      paidAmount = 0,
      purchaseDate,
      notes
    } = req.body;

    const restaurantId = req.user.restaurant;
    const createdBy = req.user._id;

    if (!supplier || !items?.length) {
      throw new Error("Supplier and items required");
    }

    // Generate Purchase Number
    const count = await Purchase.countDocuments({ restaurant: restaurantId });
    const purchaseNumber = `PUR${String(count + 1).padStart(4, "0")}`;

    // Calculate totals
    let totalAmount = 0;

    items.forEach(item => {
      const lineTotal = item.quantity * item.pricePerUnit;
      item.total = lineTotal;
      item.receivedQuantity = 0; // important
      totalAmount += lineTotal;
    });

    const purchase = await Purchase.create([{
      restaurant: restaurantId,
      supplier,
      purchaseNumber,
      items,
      totalAmount,
      paidAmount,
      balanceAmount: totalAmount - paidAmount,
      status,
      purchaseDate: purchaseDate || new Date(),
      notes,
      createdBy
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "Purchase created (No stock added yet)",
      data: purchase[0]
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};

export const receivePurchase = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const purchase = await Purchase.findById(req.params.id).session(session);
    if (!purchase) throw new Error("Purchase not found");

    if (purchase.status === "received") {
      throw new Error("Already received");
    }

    const incomingItems = req.body?.items;

    for (let item of purchase.items) {
      // determine quantity to receive; default to original quantity
      let receiveQty = item.quantity;
      if (Array.isArray(incomingItems)) {
        const match = incomingItems.find(i => i.rawMaterial?.toString() === item.rawMaterial.toString());
        if (match && typeof match.quantity === 'number') {
          receiveQty = match.quantity;
        }
      }
      item.receivedQuantity = receiveQty;

      // Inventory Transaction
      await InventoryTransaction.create([{
        restaurant: purchase.restaurant,
        rawMaterial: item.rawMaterial,
        type: "PURCHASE",
        quantity: receiveQty,
        referenceId: purchase._id,
        referenceModel: "Purchase",
        createdBy: req.user._id
      }], { session });

      const material = await RawMaterial.findById(item.rawMaterial).session(session);

      const oldStock = material.currentStock || 0;
      const oldAvg = material.averageCost || 0;

      const newAvg =
        oldStock > 0
          ? ((oldAvg * oldStock) + (receiveQty * item.pricePerUnit)) / (oldStock + receiveQty)
          : item.pricePerUnit;

      material.currentStock = oldStock + receiveQty;
      material.averageCost = newAvg;

      await material.save({ session });

      await SupplierItem.findOneAndUpdate(
        { restaurant: purchase.restaurant, supplier: purchase.supplier, rawMaterial: item.rawMaterial },
        { lastPurchasePrice: item.pricePerUnit },
        { upsert: true, session }
      );
    }

    purchase.status = "received";
    purchase.receivedAt = purchase.receivedAt || new Date();
    await purchase.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Stock received successfully",
      data: purchase
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllPurchases = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    
    const purchases = await Purchase.find({ restaurant: restaurantId, isActive: true })
      .populate("supplier", "name phone")
      .populate({
        path: "items.rawMaterial",
        select: "name purchaseUnit consumptionUnit averageCost"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases
    });

  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplier", "name phone")
      .populate({
        path: "items.rawMaterial",
        select: "name purchaseUnit consumptionUnit averageCost"
      });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found"
      });
    }

    res.status(200).json({
      success: true,
      data: purchase
    });

  } catch (error) {
    console.error("Error fetching purchase:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// export const updatePurchase = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     const {
//       isActive,
//       status,
//       paymentStatus,
//       dueDate,
//       notes,
//       orderedAt,
//       receivedAt,
//       items,
//       supplier,
//       paidAmount,
//       subTotal,
//       totalTax,
//       totalDiscount,
//       totalAmount,
//       supplierInvoiceNumber,
//       purchaseDate
//     } = req.body;

//     const restaurantId = req.user.restaurant || req.body.restaurant;
//     if (!restaurantId) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(400).json({ message: "Restaurant ID is required" });
//     }

//     const purchase = await Purchase.findOne({ _id: req.params.id, restaurant: restaurantId }).session(session);
//     if (!purchase) {
//       await session.abortTransaction();
//       session.endSession();
//       return res.status(404).json({ success: false, message: "Purchase not found" });
//     }

//     const prevStatus = purchase.status;
//     const prevItems = (purchase.items || []).map(i => ({
//       rawMaterial: i.rawMaterial.toString ? i.rawMaterial.toString() : i.rawMaterial,
//       quantity: i.quantity,
//       pricePerUnit: i.pricePerUnit
//     }));

//     // Update simple fields
//     if (isActive !== undefined) purchase.isActive = isActive;
//     if (supplier !== undefined) purchase.supplier = supplier;
//     if (supplierInvoiceNumber !== undefined) purchase.supplierInvoiceNumber = supplierInvoiceNumber;
//     if (purchaseDate !== undefined) purchase.purchaseDate = purchaseDate;
//     if (paidAmount !== undefined) purchase.paidAmount = paidAmount;

//     if (items !== undefined) {
//       // validate items
//       if (!Array.isArray(items) || items.length === 0) {
//         throw new Error('Items must be a non-empty array');
//       }
//       for (let i = 0; i < items.length; i++) {
//         const it = items[i];
//         if (!it.rawMaterial) throw new Error(`Raw material is required for item ${i + 1}`);
//         if (!it.quantity || it.quantity <= 0) throw new Error(`Valid quantity is required for item ${i + 1}`);
//         if (!it.pricePerUnit || it.pricePerUnit <= 0) throw new Error(`Valid price is required for item ${i + 1}`);
//       }

//       // recalc totals if not provided
//       let calcSub = 0, calcTax = 0, calcDisc = 0, calcTotal = 0;
//       for (let it of items) {
//         const line = it.quantity * it.pricePerUnit;
//         const tax = line * ((it.taxPercent || 0) / 100);
//         const disc = line * ((it.discount || 0) / 100);
//         const tot = line + tax - disc;
//         it.total = tot;
//         calcSub += line;
//         calcTax += tax;
//         calcDisc += disc;
//         calcTotal += tot;
//       }

//       purchase.items = items;
//       purchase.subTotal = subTotal !== undefined ? subTotal : calcSub;
//       purchase.totalTax = totalTax !== undefined ? totalTax : calcTax;
//       purchase.totalDiscount = totalDiscount !== undefined ? totalDiscount : calcDisc;
//       purchase.totalAmount = totalAmount !== undefined ? totalAmount : calcTotal;
//       purchase.balanceAmount = (purchase.totalAmount || 0) - (purchase.paidAmount || 0);
//     }

//     if (status !== undefined) {
//       // set timestamps when status changes
//       if (status === 'ordered' && !purchase.orderedAt) purchase.orderedAt = orderedAt || new Date();
//       if ((status === 'received' || status === 'partially_received') && !purchase.receivedAt) purchase.receivedAt = receivedAt || new Date();
//       purchase.status = status;
//     }

//     if (paymentStatus !== undefined) purchase.paymentStatus = paymentStatus;
//     if (dueDate !== undefined) purchase.dueDate = dueDate;
//     if (notes !== undefined) purchase.notes = notes;
//     if (orderedAt !== undefined) purchase.orderedAt = orderedAt;
//     if (receivedAt !== undefined) purchase.receivedAt = receivedAt;

//     await purchase.save({ session });

//     // Inventory adjustments
//     // If purchase moved from non-received -> received, add stock and update avg cost
//     if (prevStatus !== 'received' && (purchase.status === 'received' || purchase.status === 'partially_received')) {
//       for (let item of purchase.items) {
//         // create transaction
//         await InventoryTransaction.create([{
//           restaurant: restaurantId,
//           rawMaterial: item.rawMaterial,
//           type: "PURCHASE",
//           quantity: item.quantity,
//           unit: "purchase",
//           referenceId: purchase._id,
//           referenceModel: "Purchase",
//           createdBy: req.user?._id
//         }], { session });

//         // update supplierItem
//         await SupplierItem.findOneAndUpdate(
//           { restaurant: restaurantId, supplier: purchase.supplier, rawMaterial: item.rawMaterial },
//           { lastPurchasePrice: item.pricePerUnit },
//           { upsert: true, new: true, session }
//         );

//         // update weighted average cost
//         const material = await RawMaterial.findById(item.rawMaterial).session(session);
//         const currentStock = await InventoryTransaction.aggregate([
//           { $match: { rawMaterial: material._id, restaurant: restaurantId, type: "PURCHASE" } },
//           { $group: { _id: "$rawMaterial", totalQty: { $sum: "$quantity" } } }
//         ]).session(session);
//         const existingQty = currentStock.length ? currentStock[0].totalQty - item.quantity : 0; // exclude this purchase qty because it was just added in aggregate
//         const newQty = item.quantity;
//         const newAvgCost = (existingQty > 0)
//           ? ((material.averageCost * existingQty) + (newQty * item.pricePerUnit)) / (existingQty + newQty)
//           : item.pricePerUnit;
//         material.averageCost = newAvgCost;
//         await material.save({ session });
//       }
//     } else if (prevStatus === 'received' && (purchase.status === 'received' || purchase.status === 'partially_received') && items !== undefined) {
//       // Items changed while already received: apply delta transactions for positive diffs
//       const prevMap = new Map();
//       for (let it of prevItems) {
//         const key = it.rawMaterial.toString();
//         prevMap.set(key, (prevMap.get(key) || 0) + (it.quantity || 0));
//       }
//       const newMap = new Map();
//       for (let it of purchase.items) {
//         const key = it.rawMaterial.toString();
//         newMap.set(key, (newMap.get(key) || 0) + (it.quantity || 0));
//       }

//       for (let [rawMaterial, newQty] of newMap.entries()) {
//         const oldQty = prevMap.get(rawMaterial) || 0;
//         const delta = newQty - oldQty;
//         if (delta > 0) {
//           // add extra stock
//           const item = purchase.items.find(i => i.rawMaterial.toString() === rawMaterial);
//           await InventoryTransaction.create([{
//             restaurant: restaurantId,
//             rawMaterial: item.rawMaterial,
//             type: "PURCHASE",
//             quantity: delta,
//             unit: "purchase",
//             referenceId: purchase._id,
//             referenceModel: "Purchase",
//             createdBy: req.user?._id
//           }], { session });

//           await SupplierItem.findOneAndUpdate(
//             { restaurant: restaurantId, supplier: purchase.supplier, rawMaterial: item.rawMaterial },
//             { lastPurchasePrice: item.pricePerUnit },
//             { upsert: true, new: true, session }
//           );

//           const material = await RawMaterial.findById(item.rawMaterial).session(session);
//           const currentStock = await InventoryTransaction.aggregate([
//             { $match: { rawMaterial: material._id, restaurant: restaurantId, type: "PURCHASE" } },
//             { $group: { _id: "$rawMaterial", totalQty: { $sum: "$quantity" } } }
//           ]).session(session);
//           const existingQty = currentStock.length ? currentStock[0].totalQty - delta : 0;
//           const newAvgCost = (existingQty > 0)
//             ? ((material.averageCost * existingQty) + (delta * item.pricePerUnit)) / (existingQty + delta)
//             : item.pricePerUnit;
//           material.averageCost = newAvgCost;
//           await material.save({ session });
//         } else if (delta < 0) {
//           // reduction: create an adjustment transaction (negative qty)
//           const item = purchase.items.find(i => i.rawMaterial.toString() === rawMaterial) || { rawMaterial };
//           await InventoryTransaction.create([{
//             restaurant: restaurantId,
//             rawMaterial: item.rawMaterial,
//             type: "ADJUSTMENT",
//             quantity: delta, // negative
//             unit: "purchase",
//             referenceId: purchase._id,
//             referenceModel: "Purchase",
//             createdBy: req.user?._id
//           }], { session });
//           // do not recompute average cost for removals
//         }
//       }
//     }

//     await session.commitTransaction();
//     session.endSession();

//     // Populate response
//     await purchase.populate("supplier", "name phone");
//     await purchase.populate({
//       path: "items.rawMaterial",
//       select: "name purchaseUnit consumptionUnit averageCost"
//     });

//     res.status(200).json({
//       success: true,
//       message: "Purchase updated successfully",
//       data: purchase
//     });
//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     console.error("Error updating purchase:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// export const updatePurchase = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const purchase = await Purchase.findById(req.params.id).session(session);
//     if (!purchase) throw new Error("Purchase not found");

//     const prevStatus = purchase.status;

//     if (prevStatus === "received" && req.body.status === "draft") {
//       throw new Error("Cannot revert received purchase");
//     }

//     // capture original item list before applying updates
//     const prevItems = (purchase.items || []).map(i => ({
//       rawMaterial: i.rawMaterial.toString ? i.rawMaterial.toString() : i.rawMaterial,
//       quantity: i.quantity,
//       pricePerUnit: i.pricePerUnit
//     }));

//     Object.assign(purchase, req.body);
//     await purchase.save({ session });

//     // 🔥 compute quantity deltas between previous and updated items and adjust stock accordingly

//     // after assigning req.body and saving above, purchase contains updated items
//     const newItems = (purchase.items || []).map(i => ({
//       rawMaterial: i.rawMaterial.toString ? i.rawMaterial.toString() : i.rawMaterial,
//       quantity: i.quantity,
//       pricePerUnit: i.pricePerUnit
//     }));

//     const oldMap = new Map();
//     prevItems.forEach(i => {
//       oldMap.set(i.rawMaterial, (oldMap.get(i.rawMaterial) || 0) + i.quantity);
//     });
//     const newMap = new Map();
//     newItems.forEach(i => {
//       newMap.set(i.rawMaterial, (newMap.get(i.rawMaterial) || 0) + i.quantity);
//     });

//     // handle materials present in either set
//     const statusTransitionToReceived =
//       prevStatus !== "received" &&
//       ["received", "partially_received"].includes(purchase.status);

//     const allKeys = new Set([...oldMap.keys(), ...newMap.keys()]);
//     for (let raw of allKeys) {
//       const oldQty = oldMap.get(raw) || 0;
//       const newQty = newMap.get(raw) || 0;
//       let delta = newQty - oldQty;

//       // if quantities are same but status just became received, treat as positive delta of full qty
//       if (delta === 0 && statusTransitionToReceived) {
//         delta = newQty; // add entire quantity
//       }

//       if (delta === 0) continue;

//       // find corresponding item metadata (use newItems if available, otherwise prevItems)
//       const itemMeta = (newItems.find(i => i.rawMaterial === raw) ||
//                         prevItems.find(i => i.rawMaterial === raw));

//       if (delta > 0) {
//         // positive adjustment—add stock and update avg cost
//         await InventoryTransaction.create([{
//           restaurant: purchase.restaurant,
//           rawMaterial: raw,
//           type: "PURCHASE",
//           quantity: delta,
//           referenceId: purchase._id,
//           referenceModel: "Purchase",
//           createdBy: req.user._id
//         }], { session });

//         const material = await RawMaterial.findById(raw).session(session);
//         const oldStock = material.currentStock || 0;
//         const oldAvg = material.averageCost || 0;
//         const newAvg =
//           oldStock > 0
//             ? ((oldAvg * oldStock) + (delta * itemMeta.pricePerUnit)) / (oldStock + delta)
//             : itemMeta.pricePerUnit;
//         material.currentStock = oldStock + delta;
//         material.averageCost = newAvg;
//         await material.save({ session });

//         await SupplierItem.findOneAndUpdate(
//           { restaurant: purchase.restaurant, supplier: purchase.supplier, rawMaterial: raw },
//           { lastPurchasePrice: itemMeta.pricePerUnit },
//           { upsert: true, session }
//         );
//       } else {
//         // negative delta becomes adjustment transaction
//         await InventoryTransaction.create([{
//           restaurant: purchase.restaurant,
//           rawMaterial: raw,
//           type: "ADJUSTMENT",
//           quantity: delta,
//           referenceId: purchase._id,
//           referenceModel: "Purchase",
//           createdBy: req.user._id
//         }], { session });
//         // do not touch average cost for reductions
//       }
//     }

//     await session.commitTransaction();
//     session.endSession();

//     res.json({ success: true, message: "Purchase updated", data: purchase });

//   } catch (error) {
//     await session.abortTransaction();
//     session.endSession();
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

export const updatePurchase = async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    return res.status(404).json({ success: false, message: "Not found" });
  }

  if (purchase.status === "received") {
    return res.status(400).json({
      success: false,
      message: "Cannot edit received purchase"
    });
  }

  Object.assign(purchase, req.body);
  await purchase.save();

  res.json({ success: true, message: "Updated", data: purchase });
};


export const deletePurchase = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const purchase = await Purchase.findOne({ 
      _id: req.params.id, 
      restaurant: restaurantId 
    });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found"
      });
    }

    // Soft delete - set isActive to false
    purchase.isActive = false;
    await purchase.save();

    res.status(200).json({
      success: true,
      message: "Purchase deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting purchase:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsOrdered = async (req, res) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    return res.status(404).json({ message: "Purchase not found" });
  }

  if (purchase.status !== "draft") {
    return res.status(400).json({ message: "Only draft can be ordered" });
  }

  purchase.status = "ordered";
  purchase.orderedAt = new Date();
  await purchase.save();

  res.json({ success: true, message: "Marked as ordered" });
};