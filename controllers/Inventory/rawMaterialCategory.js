// import RawMaterialCategory from "../../models/Inventory/RawMaterialCategory.js";


// export const createCategory = async (req, res) => {
//   try {
//     const { name, description, isActive } = req.body;

//     console.log("Bhai mere ek baat batao aa kya hai",req.body)

//     const restaurantId = req.user.restaurant || req.body.restaurant;
    
//     if (!restaurantId) {
//       return res.status(400).json({
//         success: false,
//         message: "Restaurant ID is required"
//       });
//     }

//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: "Category name is required"
//       });
//     }

//     // check duplicate within restaurant
//     const existing = await RawMaterialCategory.findOne({ name, restaurant: restaurantId });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "Category already exists"
//       });
//     }

//     const category = await RawMaterialCategory.create({
//       restaurant: restaurantId,
//       name,
//       description,
//       isActive: isActive !== undefined ? isActive : true
//     });

//     res.status(201).json({
//       success: true,
//       message: "Category created successfully",
//       data: category
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



// export const getAllCategories = async (req, res) => {
//   try {
//     const restaurantId = req.user.restaurant || req.body.restaurant;
    
//     if (!restaurantId) {
//       return res.status(400).json({
//         success: false,
//         message: "Restaurant ID is required"
//       });
//     }

//     const categories = await RawMaterialCategory
//       .find({ restaurant: restaurantId, isActive: true })
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: categories.length,
//       data: categories
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



// export const getCategoryById = async (req, res) => {
//   try {

//     const category = await RawMaterialCategory.findById(req.params.id);

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: category
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



// export const updateCategory = async (req, res) => {
//   try {

//     const { name, description, isActive } = req.body;

//     const category = await RawMaterialCategory.findById(req.params.id);

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found"
//       });
//     }

//     // duplicate name check
//     if (name && name !== category.name) {
//       const existing = await RawMaterialCategory.findOne({ name });
//       if (existing) {
//         return res.status(400).json({
//           success: false,
//           message: "Category name already exists"
//         });
//       }
//     }

//     category.name = name || category.name;
//     category.description = description || category.description;

//     if (typeof isActive !== "undefined") {
//       category.isActive = isActive;
//     }

//     await category.save();

//     res.status(200).json({
//       success: true,
//       message: "Category updated successfully",
//       data: category
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };



// export const deleteCategory = async (req, res) => {
//   try {

//     const category = await RawMaterialCategory.findById(req.params.id);

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found"
//       });
//     }

//     category.isActive = false;
//     await category.save();

//     res.status(200).json({
//       success: true,
//       message: "Category deleted (soft delete) successfully"
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };




import RawMaterialCategory from "../../models/Inventory/RawMaterialCategory.js";

/* ===============================
   CREATE CATEGORY
================================= */
export const createCategory = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    const { name, description } = req.body;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant not found in user"
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required"
      });
    }

    const existing = await RawMaterialCategory.findOne({
      name: name.trim().toLowerCase(),
      restaurant: restaurantId,
      isActive: true
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Category already exists"
      });
    }

    const category = await RawMaterialCategory.create({
      restaurant: restaurantId,
      name: name.trim().toLowerCase(),
      description
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ===============================
   GET ALL CATEGORIES
================================= */
export const getAllCategories = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const categories = await RawMaterialCategory.find({
      restaurant: restaurantId,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ===============================
   GET CATEGORY BY ID (SECURE)
================================= */
export const getCategoryById = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const category = await RawMaterialCategory.findOne({
      _id: req.params.id,
      restaurant: restaurantId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ===============================
   UPDATE CATEGORY
================================= */
export const updateCategory = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;
    const { name, description, isActive } = req.body;

    const category = await RawMaterialCategory.findOne({
      _id: req.params.id,
      restaurant: restaurantId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // duplicate check within same restaurant
    if (name && name.trim().toLowerCase() !== category.name) {
      const existing = await RawMaterialCategory.findOne({
        name: name.trim().toLowerCase(),
        restaurant: restaurantId,
        _id: { $ne: req.params.id }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Category name already exists"
        });
      }

      category.name = name.trim().toLowerCase();
    }

    if (description !== undefined) {
      category.description = description;
    }

    if (typeof isActive !== "undefined") {
      category.isActive = isActive;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


/* ===============================
   DELETE CATEGORY (SOFT DELETE)
================================= */
export const deleteCategory = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const category = await RawMaterialCategory.findOne({
      _id: req.params.id,
      restaurant: restaurantId
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};