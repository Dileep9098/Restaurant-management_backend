import Expense from "../models/expenseModel.js";
import Restaurent from "../models/restaurentModel.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dxzjzmyjx',
  api_key: process.env.CLOUDINARY_API_KEY || '837636843729769',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'GvB4G9hX8kP2mT3nR7sW5qY6zA9cD2eF'
});

/**
 * CREATE EXPENSE
 */
export const createExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      subCategory,
      paymentMethod,
      paymentStatus,
      vendorName,
      vendorContact,
      billNumber,
      quantity,
      unit,
      taxAmount,
      isRecurring,
      recurringType,
      expenseDate,
      approvedBy,
      note,
    } = req.body;

    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.file);
    console.log("User:", req.user);

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Expense title is required"
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    // Find restaurant
    const restaurant = await Restaurent.findById(req.user.restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Handle bill image upload to Cloudinary
    let billImageUrl = null;
    if (req.file) {
      try {
        console.log("Uploading image to Cloudinary...");
        console.log("File details:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        const base64Data = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;
        
        const billResult = await cloudinary.uploader.upload(dataUrl, {
          folder: "expense-bills",
          resource_type: "auto",
          public_id: `bill_${Date.now()}_${Math.random().toString(36).substring(7)}`
        });
        
        billImageUrl = billResult.secure_url;
        console.log("Bill uploaded to Cloudinary:", billImageUrl);
        console.log("Cloudinary response:", billResult);
        
      } catch (cloudinaryError) {
        console.error("Cloudinary upload error:", cloudinaryError);
        console.error("Cloudinary error details:", {
          message: cloudinaryError.message,
          code: cloudinaryError.code,
          http_code: cloudinaryError.http_code
        });
        // Continue without image upload, but log the error
      }
    } else {
      console.log("No image file provided");
    }

    // Calculate total amount
    const tax = parseFloat(taxAmount) || 0;
    const total = parseFloat(amount) + tax;

    const expense = new Expense({
      restaurantId: restaurant._id,
       title,
      amount: parseFloat(amount),
      category: category || "OTHER",
      subCategory,
      paymentMethod: paymentMethod || "CASH",
      paymentStatus: paymentStatus || "PAID",
      vendorName,
      vendorContact,
      billNumber,
      billImage: billImageUrl,
      quantity: quantity ? parseFloat(quantity) : undefined,
      unit,
      taxAmount: tax,
      totalAmount: total,
      isRecurring: isRecurring === "true",
      recurringType,
      expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
      approvedBy: approvedBy || undefined,
      note,
      createdBy: req.user._id,
    });

    await expense.save();

    // Populate references
    const populatedExpense = await Expense.findById(expense._id)
      .populate("restaurantId", "name outletCode")
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .populate("updatedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: populatedExpense
    });

  } catch (error) {
    console.error("Create Expense Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * GET ALL EXPENSES
 */
export const getAllExpenses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      paymentStatus,
      startDate,
      endDate,
      search
    } = req.query;

    // Find restaurant
    const restaurant = await Restaurent.findById(req.user.restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Build query
    const query = {
      restaurantId: restaurant._id,
      status: "ACTIVE"
    };

    // Add filters
    if (category) query.category = category;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { vendorName: { $regex: search, $options: "i" } },
        { note: { $regex: search, $options: "i" } }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    const expenses = await Expense.find(query)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ expenseDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(query);

    res.status(200).json({
      success: true,
      data: expenses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Get Expenses Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * GET SINGLE EXPENSE
 */
export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate("restaurantId", "name outletCode")
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .populate("updatedBy", "name email");

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    // Check if expense belongs to user's restaurant
    if (expense.restaurantId._id.toString() !== req.user.restaurant.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });

  } catch (error) {
    console.error("Get Expense Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * UPDATE EXPENSE
 */
export const updateExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      subCategory,
      paymentMethod,
      paymentStatus,
      vendorName,
      vendorContact,
      billNumber,
      quantity,
      unit,
      taxAmount,
      isRecurring,
      recurringType,
      expenseDate,
      approvedBy,
      note,
    } = req.body;

    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    // Check if expense belongs to user's restaurant
    if (expense.restaurantId.toString() !== req.user.restaurant.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    console.log("Update Request Body:", req.body);
    console.log("Update Request Files:", req.file);

    // Handle bill image update
    if (req.file) {
      try {
        console.log("Updating image to Cloudinary...");
        console.log("File details:", {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        });
        
        // Delete old image from Cloudinary if exists
        if (expense.billImage && expense.billImage.includes("cloudinary")) {
          const publicId = expense.billImage.split('/').pop().split('.')[0];
          try {
            await cloudinary.uploader.destroy(`expense-bills/${publicId}`);
            console.log("Old bill image deleted from Cloudinary:", publicId);
          } catch (err) {
            console.warn("Failed to delete old bill image from Cloudinary:", err);
          }
        }

        // Upload new bill image
        const base64Data = req.file.buffer.toString('base64');
        const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;
        
        const billResult = await cloudinary.uploader.upload(dataUrl, {
          folder: "expense-bills",
          resource_type: "auto",
          public_id: `bill_${Date.now()}_${Math.random().toString(36).substring(7)}`
        });
        
        expense.billImage = billResult.secure_url;
        console.log("New bill image uploaded to Cloudinary:", billResult.secure_url);
        console.log("Cloudinary response:", billResult);
        
      } catch (cloudinaryError) {
        console.error("Cloudinary update error:", cloudinaryError);
        console.error("Cloudinary error details:", {
          message: cloudinaryError.message,
          code: cloudinaryError.code,
          http_code: cloudinaryError.http_code
        });
        // Continue without image update, but log the error
      }
    } else {
      console.log("No image file provided for update");
    }

    // Update fields
    if (title) expense.title = title;
    if (amount) expense.amount = parseFloat(amount);
    if (category) expense.category = category;
    if (subCategory !== undefined) expense.subCategory = subCategory;
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (paymentStatus) expense.paymentStatus = paymentStatus;
    if (vendorName !== undefined) expense.vendorName = vendorName;
    if (vendorContact !== undefined) expense.vendorContact = vendorContact;
    if (billNumber !== undefined) expense.billNumber = billNumber;
    if (quantity !== undefined) expense.quantity = parseFloat(quantity);
    if (unit !== undefined) expense.unit = unit;
    if (taxAmount !== undefined) expense.taxAmount = parseFloat(taxAmount);
    if (isRecurring !== undefined) expense.isRecurring = isRecurring === "true";
    if (recurringType !== undefined) expense.recurringType = recurringType;
    if (expenseDate) expense.expenseDate = new Date(expenseDate);
    if (approvedBy !== undefined) expense.approvedBy = approvedBy;
    if (note !== undefined) expense.note = note;

    // Recalculate total amount
    expense.totalAmount = expense.amount + (expense.taxAmount || 0);

    expense.updatedBy = req.user._id;
    await expense.save();

    // Populate references
    const updatedExpense = await Expense.findById(expense._id)
      .populate("restaurantId", "name outletCode")
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email")
      .populate("updatedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense
    });

  } catch (error) {
    console.error("Update Expense Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * DELETE EXPENSE (SOFT DELETE)
 */
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    // Check if expense belongs to user's restaurant
    if (expense.restaurantId.toString() !== req.user.restaurant.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Soft delete
    expense.status = "DELETED";
    expense.updatedBy = req.user._id;
    await expense.save();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully"
    });

  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

/**
 * GET EXPENSE SUMMARY
 */
export const getExpenseSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Find restaurant
    const restaurant = await Restaurent.findById(req.user.restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Build date filter
    const dateFilter = {
      restaurantId: restaurant._id,
      status: "ACTIVE"
    };

    if (startDate || endDate) {
      dateFilter.expenseDate = {};
      if (startDate) dateFilter.expenseDate.$gte = new Date(startDate);
      if (endDate) dateFilter.expenseDate.$lte = new Date(endDate);
    }

    // Get summary by category
    const categorySummary = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$category",
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$totalAmount" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Get payment method summary
    const paymentSummary = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get overall totals
    const totalExpenses = await Expense.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          totalTax: { $sum: "$taxAmount" },
          count: { $sum: 1 },
          avgAmount: { $avg: "$totalAmount" }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        categorySummary,
        paymentSummary,
        totals: totalExpenses[0] || {
          totalAmount: 0,
          totalTax: 0,
          count: 0,
          avgAmount: 0
        }
      }
    });

  } catch (error) {
    console.error("Get Expense Summary Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
