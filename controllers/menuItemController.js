
import fs from "fs";
import path from "path";
import MenuItem from "../models/menuItemModel.js";
import VariantGroupModel from "../models/VariantGroupModel.js";
import varianModel from "../models/varianModel.js";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

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
      const uploadPromises = req.files.map(file =>
        cloudinary.uploader.upload(
          `data:image/jpeg;base64,${file.buffer.toString('base64')}`, {
          folder: "menu-items",
          resource_type: "image",
          public_id: `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        })
      );
      const uploadResults = await Promise.all(uploadPromises);
      data.image = uploadResults.map(result => result.secure_url);
      console.log("Menu item images uploaded to Cloudinary:", uploadResults.map(r => r.secure_url));
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
      // Store old images for deletion
      const oldImages = menuItem.image || [];
      
      // Delete old images from Cloudinary
      if (oldImages.length > 0) {
        const deletePromises = oldImages.map(imgUrl => {
          if (imgUrl.includes("cloudinary")) {
            const publicId = imgUrl.split('/').pop().split('.')[0];
            return cloudinary.uploader.destroy(`menu-items/${publicId}`);
          }
        }).filter(Boolean);
        await Promise.all(deletePromises);
        console.log("Old menu item images deleted from Cloudinary");
      }

      // Upload new images to Cloudinary
      const uploadPromises = req.files.map(file =>
        cloudinary.uploader.upload(
          `data:image/jpeg;base64,${file.buffer.toString('base64')}`, {
          folder: "menu-items",
          resource_type: "image",
          public_id: `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        })
      );
      const uploadResults = await Promise.all(uploadPromises);
      
      // Replace images completely (not add to existing)
      menuItem.image = uploadResults.map(result => result.secure_url);
      console.log("New menu item images uploaded to Cloudinary:", uploadResults.map(r => r.secure_url));
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

    // 🔹 Handle multi-image deletion from Cloudinary
    if (menuItem.image && Array.isArray(menuItem.image)) {
      const deletePromises = menuItem.image.map(img => {
        if (img.includes("cloudinary")) {
          const publicId = img.split('/').pop().split('.')[0];
          return cloudinary.uploader.destroy(`menu-items/${publicId}`);
        }
      }).filter(Boolean);
      await Promise.all(deletePromises);
      console.log("Menu item images deleted from Cloudinary");
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
