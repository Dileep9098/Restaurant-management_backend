
import fs from "fs";
import path from "path";
import MenuItem from "../models/menuItemModel.js";
import VariantGroupModel from "../models/VariantGroupModel.js";
import varianModel from "../models/varianModel.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const createMenuItem = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const booleanFields = ["isVeg", "isNonVeg", "hasVariants", "hasAddOns", "isActive"];
    const sanitizedBody = { ...req.body };

    booleanFields.forEach(field => {
      if (sanitizedBody[field] !== undefined) {
        sanitizedBody[field] =
          sanitizedBody[field] === "true" ||
          sanitizedBody[field] === true ||
          sanitizedBody[field] === "on";
      }
    });

    const data = {
      ...sanitizedBody,
      restaurant: req.user.restaurant,
      createdBy: req.user._id
    };

    if (req.files && req.files.length > 0) {
      data.image = req.files.map(file => file.filename);
    }

    const menuItem = await MenuItem.create(data);

    res.status(201).json({
      success: true,
      message: "Menu item created successfully",
      data: menuItem
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


export const getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find({
      restaurant: req.user.restaurant
    })
      .populate("category", "name")
      .populate("tax", "name percent")
      .sort({ sortOrder: 1 });

    const variantGroups = await VariantGroupModel.find({
      restaurant: req.user.restaurant,
      isActive: true,
      menuItem: { $in: items.map(i => i._id) }
    });

    const variants = await varianModel.find({
      restaurant: req.user.restaurant,
      isActive: true,
      variantGroup: { $in: variantGroups.map(vg => vg._id) }
    });

    res.json({
      success: true,
      data: {
        items,
        variantGroups,
        variants
      }

    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


export const getMenuItemById = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id)
      .populate("category")
      .populate("tax");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};




export const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found"
      });
    }

    /* =========================
       HANDLE MULTI IMAGES
    ========================= */

    if (req.files && req.files.length > 0) {

      // 🔥 delete old images
      if (menuItem.image?.length) {
        menuItem.image.forEach(img => {
          // const oldPath = path.resolve(
          //   "../my-app/public/assets/images/menu",
          //   img
          // );
          let oldPath;
          // if (process.env.NODE_ENV === 'development') {
          //   oldPath = path.resolve(
          //     "../my-app/public/assets/images/menu",
          //     img
          //   );
          // } else {
          //   oldPath = path.resolve(
          //     "https://restaurant-management-f.vercel.app/assets/images/menu",
          //     img
          //   );
          // }
          oldPath = path.resolve(__dirname, "../uploads/menu", img);

          if (fs.existsSync(oldPath)) {
            fs.unlink(oldPath, err => {
              if (err) console.error("Image delete error:", err);
            });
          }
        });
      }

      // ✅ save new images
      menuItem.image = req.files.map(file => file.filename);
    }

    /* =========================
       UPDATE OTHER FIELDS
    ========================= */

    const allowedFields = [
      "name",
      "category",
      "description",
      "basePrice",
      "tax",
      "isVeg",
      "isAvailable",
      "hasVariants",
      "hasAddOns",
      "sortOrder",
      "availableFor"
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        menuItem[field] = req.body[field];
      }
    });

    await menuItem.save();

    res.status(200).json({
      success: true,
      message: "Menu item updated successfully",
      data: menuItem
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};



export const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant
    });

    if (!menuItem) {
      return res.status(404).json({ success: false, message: "Menu item not found" });
    }

    // 🔹 Handle multi-image deletion
    if (menuItem.image && Array.isArray(menuItem.image)) {
      menuItem.image.forEach(img => {
        // const imagePath = path.resolve("../my-app/public/assets/images/menu", img);
        let imagePath;
        // if (process.env.NODE_ENV === 'development') {
        //   imagePath = path.resolve("../my-app/public/assets/images/menu", img);
        // } else {
        //   imagePath = path.resolve("https://restaurant-management-f.vercel.app/assets/images/menu", img);
        // }
        imagePath = path.resolve(__dirname, "../uploads/menu", img);
        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, err => {
            if (err) console.error("Image delete error:", err);
          });
        }
      });
    }

    await menuItem.deleteOne();

    res.status(200).json({
      success: true,
      message: "Menu item deleted successfully"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
