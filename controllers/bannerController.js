import Banners from "../models/bannersModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Banner
export const createBanner = async (req, res) => {
  try {
    const { mainHead, subHead, status } = req.body;
     if (!req.user || !req.user.restaurant) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
    
    let fileUrl = null;
    
    if (req.file) {
      // Upload to Cloudinary from buffer (memory storage)
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`, {
        folder: "banners",
        resource_type: "image"
      });
      fileUrl = result.secure_url;
      console.log("Banner uploaded to Cloudinary:", fileUrl);
    } else {
      return res.status(400).json({ message: "File is required" });
    }

    const banner = await Banners.create({ mainHead, subHead, status, file: fileUrl,restaurant: req.user.restaurant,
 });
    res.status(201).json({ success: true, banner, message: "Banner Added Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Banners
export const getAllBanners = async (req, res) => {
  const restaurantId = req.user?.restaurant || req.query.restaurant;

  console.log("Restaurant aa raha hai ghj:", restaurantId);
  // console.log("Restaurant aa raha hai Query:", query);

  try {
    let query = {};

    if (restaurantId) {
      query.restaurant = restaurantId; // 👈 filter lagao
    }

    const banners = await Banners.find(query).sort({ createdAt: -1 });

    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Banner
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banners.findById({ restaurant: req.user.restaurant, _id: req.params.id });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const updateBanner = async (req, res) => {
  try {
    const { mainHead, subHead, status } = req.body;
    
    console.log("Update Banner called with:", { mainHead, subHead, status });

    // Find existing banner
    const existingBanner = await Banners.findById(req.params.id);
    if (!existingBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const updateData = { mainHead, subHead, status };

    if (req.file) {
      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`, {
        folder: "banners",
        resource_type: "image"
      });
      updateData.file = result.secure_url;
      console.log("New banner uploaded to Cloudinary:", result.secure_url);
      
      // Delete old image from Cloudinary if it's not default
      if (existingBanner.file && existingBanner.file.includes("cloudinary")) {
        const publicId = existingBanner.file.split('/').pop().split('.')[0];
        try {
          await cloudinary.uploader.destroy(`banners/${publicId}`);
          console.log("Old banner deleted from Cloudinary:", publicId);
        } catch (err) {
          console.warn("Failed to delete old banner from Cloudinary:", err);
        }
      }
    }

    // Update DB
    const updatedBanner = await Banners.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      banner: updatedBanner,
      message: "Banner updated successfully",
    });
  } catch (error) {
    console.error("Error in updateBanner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banners.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    // Delete image from Cloudinary if it's not default
    if (banner.file && banner.file.includes("cloudinary")) {
      const publicId = banner.file.split('/').pop().split('.')[0];
      try {
        await cloudinary.uploader.destroy(`banners/${publicId}`);
        console.log("Banner deleted from Cloudinary:", publicId);
      } catch (err) {
        console.warn("Failed to delete banner from Cloudinary:", err);
      }
    }

    await Banners.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBanner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};




// export const updateBanner = async (req, res) => {
//   try {
//     const { mainHead, subHead, status } = req.body;
//     const newFile = req.file ? req.file.filename : req.body.file;

//     console.log("Update Banner called with:", { mainHead, subHead, status, newFile });

//     // Find existing banner
//     const existingBanner = await Banners.findById(req.params.id);
//     if (!existingBanner) {
//       return res.status(404).json({ message: "Banner not found" });
//     }

//     const updateData = { mainHead, subHead, status };

//     if (newFile && newFile !== existingBanner.file) {
//       // 🔥 Delete old file
//       if (existingBanner.file) {
//         let oldFilePath;
//         if (process.env.NODE_ENV === 'development') {
//           oldFilePath = path.resolve("../my-app/public/assets/images/banner", existingBanner.file);
//         } else {
//           oldFilePath = path.resolve("https://restaurant-management-f.vercel.app/assets/images/banner", existingBanner.file);

//         }

//         console.log("Old Image kya hai", oldFilePath)
//         fs.access(oldFilePath, fs.constants.F_OK, err => {
//           if (!err) {
//             fs.unlink(oldFilePath, err => {
//               if (err) console.error("Old banner deletion error:", err);
//               else console.log("Old banner deleted successfully.");
//             });
//           } else {
//             console.warn("Old banner not found, nothing to delete.");
//           }
//         });
//       }

//       // ✅ Save new file
//       updateData.file = newFile;
//     }

//     // Update DB
//     const updatedBanner = await Banners.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//     });

//     res.status(200).json({
//       success: true,
//       banner: updatedBanner,
//       message: "Banner updated successfully",
//     });
//   } catch (error) {
//     console.error("Error in updateBanner:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Delete Banner
// export const deleteBanner = async (req, res) => {
//   try {
//     const banner = await Banners.findById(req.params.id);
//     if (!banner) return res.status(404).json({ message: "Banner not found" });

//     if (banner.file) {
//       // const filePath = path.resolve( __dirname,"../my-app/public/assets/images/banner", banner.file );
//       let filePath;
//         if (process.env.NODE_ENV === 'development') {
//           filePath = path.resolve( __dirname,"../my-app/public/assets/images/banner", banner.file );
//         } else {
//           filePath = path.resolve( __dirname,"https://restaurant-management-f.vercel.app/assets/images/banner", banner.file);

//         }

//       fs.access(filePath, fs.constants.F_OK, (err) => {
//         if (!err) {
//           fs.unlink(filePath, (err) => {
//             if (err) console.error("Error deleting banner image:", err);
//             else console.log("Banner image deleted successfully.");
//           });
//         } else {
//           console.warn("Banner image not found, nothing to delete.");
//         }
//       });
//     }

//     await Banners.findByIdAndDelete(req.params.id);

//     res.status(200).json({ success: true, message: "Banner deleted successfully" });
//   } catch (error) {
//     console.error("Error in deleteBanner:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };