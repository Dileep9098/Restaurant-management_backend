// import RawMaterial from "../models/RawMaterial.js";
// import RawMaterialCategory from "../models/RawMaterialCategory.js";
// import InventoryTransaction from "../models/InventoryTransaction.js";

import InventoryTransaction from "../../models/Inventory/InventoryTransaction.js";
import RawMaterial from "../../models/Inventory/RawMaterial.js";
import RawMaterialCategory from "../../models/Inventory/RawMaterialCategory.js";


// ✅ 1️⃣ CREATE RAW MATERIAL
// export const createRawMaterial = async (req, res) => {
//   try {
//     const { name, category, purchaseUnit, consumptionUnit, conversionRate, minStockLevel, reorderQuantity, storageType } = req.body;
//     const restaurantId = req.user.restaurant || req.body.restaurant;

//     if (!restaurantId) {
//       return res.status(400).json({
//         success: false,
//         message: "Restaurant ID is required"
//       });
//     }

//     if (!name || !category || !purchaseUnit || !consumptionUnit || !conversionRate) {
//       return res.status(400).json({
//         success: false,
//         message: "Name, Category, Purchase Unit, Consumption Unit and Conversion Rate are required"
//       });
//     }

//     // category check
//     const categoryExists = await RawMaterialCategory.findById(category);
//     if (!categoryExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid category"
//       });
//     }

//     // duplicate check within restaurant
//     const existing = await RawMaterial.findOne({ name, restaurant: restaurantId });
//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "Raw material already exists"
//       });
//     }

//     const material = await RawMaterial.create({
//       restaurant: restaurantId,
//       name,
//       category,
//       purchaseUnit,
//       consumptionUnit,
//       conversionRate,
//       minStockLevel,
//       reorderQuantity,
//       storageType
//     });

//     res.status(201).json({
//       success: true,
//       message: "Raw material created successfully",
//       data: material
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const createRawMaterial = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    const {
      name,
      category,
      purchaseUnit,
      consumptionUnit,
      conversionRate,
      minStockLevel,
      reorderQuantity,
      storageType
    } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant not found in user"
      });
    }

    if (!name || !category || !purchaseUnit || !consumptionUnit || !conversionRate) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing"
      });
    }

    // ✅ category restaurant scoped validation
    const categoryExists = await RawMaterialCategory.findOne({
      _id: category,
      restaurant: restaurantId,
      isActive: true
    });

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: "Invalid category"
      });
    }

    // ✅ duplicate check restaurant scoped
    const existing = await RawMaterial.findOne({
      name: name.trim().toLowerCase(),
      restaurant: restaurantId,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Raw material already exists"
      });
    }

    const material = await RawMaterial.create({
      restaurant: restaurantId,
      name: name.trim().toLowerCase(),
      category,
      purchaseUnit,
      consumptionUnit,
      conversionRate,
      minStockLevel,
      reorderQuantity,
      storageType
    });

    res.status(201).json({
      success: true,
      message: "Raw material created successfully",
      data: material
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 2️⃣ GET ALL RAW MATERIALS
// export const getAllRawMaterials = async (req, res) => {
//   try {
//     const restaurantId = req.user.restaurant || req.body.restaurant;

//     if (!restaurantId) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Restaurant ID is required" 
//       });
//     }

//     const materials = await RawMaterial.find({ restaurant: restaurantId, isActive: true })
//       .populate("category")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: materials.length,
//       data: materials
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const getAllRawMaterials = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const materials = await RawMaterial.find({
      restaurant: restaurantId,
      
    })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ 3️⃣ GET SINGLE RAW MATERIAL
// export const getRawMaterialById = async (req, res) => {
//   try {

//     const material = await RawMaterial.findById(req.params.id)
//       .populate("category");

//     if (!material) {
//       return res.status(404).json({
//         success: false,
//         message: "Raw material not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: material
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const getRawMaterialById = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const material = await RawMaterial.findOne({
      _id: req.params.id,
      restaurant: restaurantId
    }).populate("category", "name");

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Raw material not found"
      });
    }

    res.status(200).json({
      success: true,
      data: material
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// 4️⃣ UPDATE RAW MATERIAL
// export const updateRawMaterial = async (req, res) => {
//   try {

//     const { name, category, purchaseUnit, consumptionUnit, conversionRate, minStockLevel, reorderQuantity, storageType, isActive } = req.body;

//     const material = await RawMaterial.findById(req.params.id);

//     if (!material) {
//       return res.status(404).json({
//         success: false,
//         message: "Raw material not found"
//       });
//     }

//     // duplicate check
//     if (name && name !== material.name) {
//       const existing = await RawMaterial.findOne({ name });
//       if (existing) {
//         return res.status(400).json({
//           success: false,
//           message: "Raw material name already exists"
//         });
//       }
//     }

//     material.name = name || material.name;
//     material.category = category || material.category;
//     material.purchaseUnit = purchaseUnit || material.purchaseUnit;
//     material.consumptionUnit = consumptionUnit || material.consumptionUnit;
//     material.conversionRate = conversionRate || material.conversionRate;
//     material.minStockLevel = minStockLevel ?? material.minStockLevel;
//     material.reorderQuantity = reorderQuantity ?? material.reorderQuantity;
//     material.storageType = storageType || material.storageType;

//     if (typeof isActive !== "undefined") {
//       material.isActive = isActive;
//     }

//     await material.save();

//     res.status(200).json({
//       success: true,
//       message: "Raw material updated successfully",
//       data: material
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


export const updateRawMaterial = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    const updates = req.body;

    const material = await RawMaterial.findOne({
      _id: req.params.id,
      restaurant: restaurantId
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Raw material not found"
      });
    }

    if (updates.name && updates.name.trim().toLowerCase() !== material.name) {
      const existing = await RawMaterial.findOne({
        name: updates.name.trim().toLowerCase(),
        restaurant: restaurantId,
        _id: { $ne: req.params.id }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Raw material already exists"
        });
      }

      material.name = updates.name.trim().toLowerCase();
    }

    Object.assign(material, updates);

    await material.save();

    res.status(200).json({
      success: true,
      message: "Raw material updated successfully",
      data: material
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5️⃣ SOFT DELETE
// export const deleteRawMaterial = async (req, res) => {
//   try {

//     const material = await RawMaterial.findById(req.params.id);

//     if (!material) {
//       return res.status(404).json({
//         success: false,
//         message: "Raw material not found"
//       });
//     }

//     material.isActive = false;
//     await material.save();

//     res.status(200).json({
//       success: true,
//       message: "Raw material deleted successfully"
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

export const deleteRawMaterial = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const material = await RawMaterial.findOne({
      _id: req.params.id,
      restaurant: restaurantId
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Raw material not found"
      });
    }

    material.isActive = false;
    await material.save();

    res.status(200).json({
      success: true,
      message: "Raw material deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


// ✅ 6️⃣ LOW STOCK API (Advanced 🔥)
export const getLowStockMaterials = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const lowStockItems = await RawMaterial.find({
      restaurant: restaurantId,
      isActive: true,
      $expr: { $lte: ["$currentStock", "$minStockLevel"] }
    }).populate("category", "name");

    res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};