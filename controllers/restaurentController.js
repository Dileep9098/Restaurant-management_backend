import Restaurent from "../models/restaurentModel.js";
import User from "../models/userModel.js";
// import Role from "../models/roleModel.js";
import bcrypt from "bcrypt";
import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * CREATE RESTAURANT
 */
// export const createRestaurant = async (req, res) => {
//   try {
//     const {
//       name,
//       outletCode,
//       phone,
//       email,
//       address,
//       gstNumber,
//       isActive

//     } = req.body;

//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: "Restaurant name is required"
//       });
//     }

//     // check outlet code unique
//     if (outletCode) {
//       const exist = await Restaurent.findOne({ outletCode });
//       if (exist) {
//         return res.status(400).json({
//           success: false,
//           message: "Outlet code already exists"
//         });
//       }
//     }

//     const restaurant = await Restaurent.create({
//       name,
//       outletCode,
//       phone,
//       email,
//       address,
//       gstNumber,isActive,
//       createdBy: req.user._id
//     });

//     res.status(201).json({
//       success: true,
//       message: "Restaurant created successfully",
//       data: restaurant
//     });

export const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      outletCode,
      phone,
      email,
      address,
      gstNumber,
      isActive,
      serviceType,
    } = req.body;

    console.log("Request Body:", req.body);
    console.log("Uploaded Files:", req.files);

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required"
      });
    }

    if (outletCode) {
      const exist = await Restaurent.findOne({ outletCode });
      if (exist) {
        return res.status(400).json({
          success: false,
          message: "Outlet code already exists"
        });
      }
    }

    // Handle file uploads
    let logoPath = "resLogo.png";
    let qrCodePath = "qrcodePayment.png";

    if (req.files) {
      if (req.files.file && req.files.file[0]) {
        logoPath = req.files.file[0].filename;
        console.log("Logo uploaded:", logoPath);
      }

      if (req.files.qrCode && req.files.qrCode[0]) {
        qrCodePath = req.files.qrCode[0].filename;
        console.log("QR Code uploaded:", qrCodePath);
      }
    }

    const restaurant = new Restaurent({
      name,
      outletCode,
      phone,
      email,
      address: typeof address === 'string' ? JSON.parse(address) : address,
      gstNumber,
      isActive,
      serviceType,
      logo: logoPath,
      qrCodeForPayment: qrCodePath,
      createdBy: req.user.id
    });

    await restaurant.save();

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant
    });

  } catch (error) {
    console.error("Create Restaurant Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


export const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurent.find()
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants
    });

  } catch (error) {
    console.error("Get Restaurants Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
/**
* GET SINGLE RESTAURANT
*/
export const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurent.findById(req.params.id)
      .populate("createdBy", "name email");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    res.status(200).json({
      success: true,
      data: restaurant
    });

  } catch (error) {
    console.error("Get Restaurant Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
/**
 * UPDATE RESTAURANT
 */


export const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurent.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const {
      name,
      outletCode,
      phone,
      email,
      gstNumber,
      isActive,
      serviceType,
    } = req.body;

    // address update
    restaurant.address = {
      line1: req.body['address[line1]'] || restaurant.address?.line1,
      city: req.body['address[city]'] || restaurant.address?.city,
      state: req.body['address[state]'] || restaurant.address?.state,
      pincode: req.body['address[pincode]'] || restaurant.address?.pincode,
    };

    // LOGO UPDATE
    if (req.files && req.files.file && req.files.file[0]) {
      // delete old logo
      if (restaurant.logo) {
        const oldPath = path.resolve(`.${restaurant.logo}`);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      restaurant.logo = `${req.files.file[0].filename}`;
    }

    // QR CODE UPDATE
    if (req.files && req.files.qrCode && req.files.qrCode[0]) {
      // delete old QR code
      if (restaurant.qrCodeForPayment) {
        const oldQrPath = path.resolve(`.${restaurant.qrCodeForPayment}`);
        if (fs.existsSync(oldQrPath)) {
          fs.unlinkSync(oldQrPath);
        }
      }

      restaurant.qrCodeForPayment = `${req.files.qrCode[0].filename}`;
    }

    restaurant.name = name || restaurant.name;
    restaurant.outletCode = outletCode || restaurant.outletCode;
    restaurant.phone = phone || restaurant.phone;
    restaurant.email = email || restaurant.email;
    restaurant.gstNumber = gstNumber || restaurant.gstNumber;
    restaurant.serviceType = serviceType || restaurant.serviceType;
    restaurant.isActive =
      isActive !== undefined ? isActive : restaurant.isActive;

    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    });

  } catch (error) {
    console.error("Update Restaurant Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


/**
 * TOGGLE RESTAURANT STATUS
 */
export const toggleRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await Restaurent.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    restaurant.isActive = !restaurant.isActive;
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: `Restaurant ${restaurant.isActive ? "Activated" : "Deactivated"}`,
      data: restaurant
    });

  } catch (error) {
    console.error("Toggle Status Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



export const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurent.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (restaurant.logo) {
      const logoPath = path.join(__dirname, "../", restaurant.logo); 

      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
        console.log("Restaurant logo deleted successfully:", logoPath);
      } else {
        console.warn("Logo file not found for deletion:", logoPath);
      }
    }

      await restaurant.deleteOne();

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });

  } catch (error) {
    console.error("Delete Restaurant Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// export const createRestaurantUser = async (req, res) => {
//   try {
//     const { name, email, phone, password, role, restaurant, status } = req.body;

//     if (!name || !email || !password || !role || !restaurant) {
//       return res.status(400).json({ success: false, message: "All fields required" });
//     }

//     const exists = await User.findOne({ email });
//     if (exists) {
//       return res.status(400).json({ success: false, message: "User already exists" });
//     }

//     // ✅ Restaurant valid?
//     const rest = await Restaurent.findById(restaurant);
//     if (!rest) {
//       return res.status(404).json({ success: false, message: "Restaurant not found" });
//     }

//     // ✅ Role valid + same restaurant?
//     const roleDoc = await Role.findById(role);
//     if (!roleDoc) {
//       return res.status(404).json({ success: false, message: "Role not found" });
//     }

//     if (roleDoc.restaurant.toString() !== restaurant.toString()) {
//       return res.status(400).json({
//         success: false,
//         message: "Selected role does not belong to this restaurant"
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       phone,
//       password: hashedPassword,
//       role,
//       restaurant,
//       status: status || "active",
//       createdBy: req.user._id
//     });

//     res.status(201).json({
//       success: true,
//       message: "Restaurant user created successfully",
//       data: user
//     });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



import Permissions from "../models/permissionModel.js";
import RolePermission from "../models/RolePermissionModel.js";
import Role from "../models/roleModel.js";

import mongoose from "mongoose";

// import bcrypt from "bcrypt";
// import User from "../models/User.js";
// import Role from "../models/Role.js";
// import Restaurent from "../models/Restaurant.js";
// import RolePermission from "../models/RolePermission.js";
// import Permissions from "../models/Permissions.js";

export const createRestaurantUser = async (req, res) => {
  try {
    const { moduleData, permissions } = req.body || {};
    const {
      name, email, phone, password,
      restaurantId, role: roleName, status, isVerified
    } = moduleData || {};

    if (!name || !email || !password || !restaurantId || !roleName) {
      return res.status(400).json({
        success: false,
        message: "name, email, password, restaurantId, role required"
      });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "User already exists" });

    const rest = await Restaurent.findById(restaurantId);
    if (!rest) return res.status(404).json({ success: false, message: "Restaurant not found" });

    const normalizedRoleName = String(roleName).trim().toLowerCase();

    // find or create role
    let roleDoc = await Role.findOne({ name: normalizedRoleName, restaurant: restaurantId });
    if (!roleDoc) {
      roleDoc = await Role.create({ name: normalizedRoleName, restaurant: restaurantId, isActive: true });
    }

    let finalPermissions = Array.isArray(permissions) ? permissions : [];

    // admin default all
    if (normalizedRoleName === "admin" && finalPermissions.length === 0) {
      const modules = await Permissions.find({ isActive: true });
      const allKeys = [];
      modules.forEach(m => m.submenus?.forEach(s => s.actions?.forEach(a => allKeys.push(a.key))));
      finalPermissions = allKeys;
    }

    finalPermissions = [...new Set(finalPermissions)];

    await RolePermission.findOneAndUpdate(
      { restaurant: restaurantId, role: roleDoc._id },
      { permissions: finalPermissions, isActive: true },
      { upsert: true, new: true }
    );

    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role: roleDoc._id,
      restaurant: restaurantId,
      status: status || "active",
      isVerified: !!isVerified,
      createdBy: req.user._id
    });

    const populatedUser = await User.findById(user._id)
      .populate("restaurant", "name outletCode")
      .populate("role", "name")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Restaurant user created successfully (role + permissions applied)",
      data: populatedUser
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



export const getRestaurantUsers = async (req, res) => {
  try {
    // Find users that belong to restaurants
    const users = await User.find({ restaurant: { $exists: true, $ne: null } })
      .populate("restaurant", "name outletCode")
      .populate("role", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// export const getRestaurantUsers = async (req, res) => {
//   try {
//     const restaurantId = req.user.restaurant;

//     const users = await User.find({ restaurant: restaurantId })
//       .populate("restaurant", "name outletCode")
//       .populate("role", "name")
//       .populate("createdBy", "name email")
//       .sort({ createdAt: -1 });

//     res.json({ success: true, count: users.length, data: users });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };



export const updateRestaurantUser = async (req, res) => {
  try {
    const { moduleData, permissions } = req.body || {};
    const {
      name, email, phone, password,
      restaurantId, role: roleName, status, isVerified
    } = moduleData || {};

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If email is changing, check uniqueness
    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ success: false, message: "Email already exists" });
    }

    // If restaurantId is provided, validate it
    if (restaurantId) {
      const rest = await Restaurent.findById(restaurantId);
      if (!rest) return res.status(404).json({ success: false, message: "Restaurant not found" });
    }

    let finalRoleId = user.role;

    // If roleName is provided, find or create role
    if (roleName) {
      const normalizedRoleName = String(roleName).trim().toLowerCase();
      const targetRestaurantId = restaurantId || user.restaurant;

      let roleDoc = await Role.findOne({ name: normalizedRoleName, restaurant: targetRestaurantId });
      if (!roleDoc) {
        roleDoc = await Role.create({ name: normalizedRoleName, restaurant: targetRestaurantId, isActive: true });
      }
      finalRoleId = roleDoc._id;

      // Update permissions if provided
      if (permissions && Array.isArray(permissions)) {
        let finalPermissions = [...new Set(permissions)];

        // If admin and no permissions, assign all
        if (normalizedRoleName === "admin" && finalPermissions.length === 0) {
          const modules = await Permissions.find({ isActive: true });
          const allKeys = [];
          modules.forEach(m => m.submenus?.forEach(s => s.actions?.forEach(a => allKeys.push(a.key))));
          finalPermissions = allKeys;
        }

        await RolePermission.findOneAndUpdate(
          { restaurant: targetRestaurantId, role: roleDoc._id },
          { permissions: finalPermissions, isActive: true },
          { upsert: true, new: true }
        );
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (password) updateData.password = await bcrypt.hash(password, 10);
    if (restaurantId) updateData.restaurant = restaurantId;
    if (finalRoleId) updateData.role = finalRoleId;
    if (status) updateData.status = status;
    if (isVerified !== undefined) updateData.isVerified = !!isVerified;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate("restaurant", "name outletCode")
      .populate("role", "name")
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      message: "Restaurant user updated successfully",
      data: updatedUser
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const deleteRestaurantUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "Restaurant user deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};