import SupplierItem from "../../models/Inventory/SupplierItem.js";


export const createSupplierItem = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant not found in user"
      });
    }

    const {
      supplier,
      rawMaterial,
      lastPurchasePrice,
      preferredUnit = "purchase",
      leadTime = 0,
      minOrderQuantity = 1
    } = req.body;

    if (!supplier || !rawMaterial) {
      return res.status(400).json({
        success: false,
        message: "Supplier and Raw Material are required"
      });
    }

    // Strong duplicate protection
    const existing = await SupplierItem.findOne({
      supplier,
      rawMaterial,
      restaurant: restaurantId,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This raw material already linked with supplier"
      });
    }

    const supplierItem = await SupplierItem.create({
      restaurant: restaurantId,
      supplier,
      rawMaterial,
      lastPurchasePrice,
      preferredUnit,
      leadTime,
      minOrderQuantity
    });

    const populatedItem = await SupplierItem.findById(supplierItem._id)
      .populate("supplier", "name phone email")
      .populate("rawMaterial", "name purchaseUnit consumptionUnit averageCost");

    res.status(201).json({
      success: true,
      message: "Supplier item created successfully",
      data: populatedItem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getItemsBySupplier = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    const items = await SupplierItem.find({
      supplier: req.params.supplierId,
      restaurant: restaurantId,
      isActive: true
    })
      .populate("supplier", "name phone email gstNumber panNumber paymentTerms bankDetails")
      .populate("rawMaterial", "name purchaseUnit consumptionUnit averageCost minStockLevel reorderQuantity storageType")
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      success: true, 
      count: items.length,
      data: items 
    });

  } catch (error) {
    console.error("Error fetching items by supplier:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


export const getAllSupplierItems = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const items = await SupplierItem.find({
      restaurant: restaurantId,
      isActive: true
    })
      .populate("supplier", "name phone email")
      .populate("rawMaterial", "name purchaseUnit consumptionUnit averageCost")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
export const getSupplierItemById = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    const item = await SupplierItem.findOne({ 
      _id: req.params.id,
      restaurant: restaurantId 
    })
      .populate("supplier", "name phone email gstNumber panNumber paymentTerms bankDetails")
      .populate("rawMaterial", "name purchaseUnit consumptionUnit averageCost minStockLevel reorderQuantity storageType");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Supplier item not found"
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });

  } catch (error) {
    console.error("Error fetching supplier item:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const updateSupplierItem = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    const { id } = req.params;

    const item = await SupplierItem.findOne({
      _id: id,
      restaurant: restaurantId,
      isActive: true
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Supplier item not found"
      });
    }

    const newSupplier = req.body.supplier || item.supplier;
    const newRawMaterial = req.body.rawMaterial || item.rawMaterial;

    // Strong duplicate protection
    const duplicate = await SupplierItem.findOne({
      supplier: newSupplier,
      rawMaterial: newRawMaterial,
      restaurant: restaurantId,
      _id: { $ne: id },
      isActive: true
    });

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "This supplier already linked with this raw material"
      });
    }

    Object.assign(item, req.body);
    await item.save();

    const updatedItem = await SupplierItem.findById(id)
      .populate("supplier", "name phone email")
      .populate("rawMaterial", "name purchaseUnit consumptionUnit averageCost");

    res.status(200).json({
      success: true,
      message: "Supplier item updated successfully",
      data: updatedItem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteSupplierItem = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    const { id } = req.params;

    const item = await SupplierItem.findOne({
      _id: id,
      restaurant: restaurantId,
      isActive: true
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Supplier item not found"
      });
    }

    item.isActive = false;
    await item.save();

    res.status(200).json({
      success: true,
      message: "Supplier item deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const reactivateSupplierItem = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    const item = await SupplierItem.findOne({ 
      _id: req.params.id,
      restaurant: restaurantId 
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Supplier item not found"
      });
    }

    item.isActive = true;
    await item.save();

    // Populate response
    await item.populate("supplier", "name phone email");
    await item.populate("rawMaterial", "name purchaseUnit consumptionUnit averageCost");

    res.status(200).json({
      success: true,
      message: "Supplier item reactivated successfully",
      data: item
    });

  } catch (error) {
    console.error("Error reactivating supplier item:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSuppliersByRawMaterial = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    const items = await SupplierItem.find({
      rawMaterial: req.params.rawMaterialId,
      restaurant: restaurantId,
      isActive: true
    })
      .populate("supplier", "name phone email gstNumber panNumber paymentTerms bankDetails")
      .populate("rawMaterial", "name purchaseUnit consumptionUnit averageCost")
      .sort({ lastPurchasePrice: 1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });

  } catch (error) {
    console.error("Error fetching suppliers by raw material:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


