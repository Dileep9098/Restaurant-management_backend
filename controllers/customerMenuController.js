// import Category from "../models/categoryModel.js";
// import MenuItem from "../models/menuItemModel.js";
// import VariantGroup from "../models/VariantGroupModel.js";
// import Variant from "../models/varianModel.js";
// import Table from "../models/tableModel.js";

import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import menuItemModel from "../models/menuItemModel.js";
import Table from "../models/tableModel.js";
import varianModel from "../models/varianModel.js";
import VariantGroupModel from "../models/VariantGroupModel.js";

// export const getCustomerMenu = async (req, res) => {
//   try {
//     const { restaurant, table } = req.query;

//     if (!restaurant || !table) {
//       return res.status(400).json({
//         success: false,
//         message: "Restaurant & Table required"
//       });
//     }

//     // ✅ table verify
//     const tableData = await Table.findOne({
//       _id: table,
//       restaurant,
//       isActive: true
//     });

//     if (!tableData) {
//       return res.status(404).json({
//         success: false,
//         message: "Invalid table"
//       });
//     }

//     // ✅ categories
//     const categories = await categoryModel.find({
//       restaurant,
//       isActive: true
//     }).sort({ sortOrder: 1 }).populate("restaurant", "name logo");

//     // ✅ items
//     const items = await menuItemModel.find({
//       restaurant,
//       isAvailable: true
//     });

//     // ✅ variant groups
//     const variantGroups = await VariantGroupModel.find({
//       restaurant,
//       isActive: true
//     });

//     // ✅ variants
//     const variants = await varianModel.find({
//       restaurant,
//       isActive: true
//     });

//     res.json({
//       success: true,
//       table: {
//         id: tableData._id,
//         tableNumber: tableData.tableNumber
//       },
//       data: {
//         categories,
//         items,
//         variantGroups,
//         variants
//       }
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };


export const getCustomerMenu = async (req, res) => {
  try {
    const {
      restaurant,
      table,
      search = "",
      category,
      type,
      page = 1,
      limit = 4
    } = req.query;

    if (!restaurant || !table) {
      return res.status(400).json({
        success: false,
        message: "Restaurant & Table required"
      });
    }

    // ✅ Table verify
    const tableData = await Table.findOne({
      _id: table,
      restaurant,
      isActive: true
    });

    if (!tableData) {
      return res.status(404).json({
        success: false,
        message: "Invalid table"
      });
    }

    // ✅ Categories
    const categories = await categoryModel
      .find({ restaurant, isActive: true })
      .sort({ sortOrder: 1 })
      .populate("restaurant", "name logo");


    let itemFilter = {
      restaurant,
      isAvailable: true
    };

    if (search) {
      itemFilter.name = { $regex: search, $options: "i" };
    }

    // if (category && category !== "all") {
    //   itemFilter.category = category;
    // }

    if (category && category !== "all") {
      itemFilter.category = new mongoose.Types.ObjectId(category);
    }


    if (type === "veg") itemFilter.isVeg = true;
    if (type === "nonveg") itemFilter.isVeg = false;

    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      menuItemModel
        .find(itemFilter).populate("restaurant", "name logo").populate("tax", "name percent appliesTo")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),

      menuItemModel.countDocuments(itemFilter)
    ]);

    // const variantGroups = await VariantGroupModel.find({
    //   restaurant,
    //   isActive: true
    // });

    // const variants = await varianModel.find({
    //   restaurant,
    //   isActive: true
    // });

    const variantGroups = await VariantGroupModel.find({
      restaurant,
      isActive: true,
      menuItem: { $in: items.map(i => i._id) }
    });

    const variants = await varianModel.find({
      restaurant,
      isActive: true,
      variantGroup: { $in: variantGroups.map(vg => vg._id) }
    });


    res.json({
      success: true,
      table: {
        id: tableData._id,
        tableNumber: tableData.tableNumber
      },
      pagination: {
        totalItems,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + items.length < totalItems
      },
      data: {
        categories,
        items,
        variantGroups,
        variants
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
