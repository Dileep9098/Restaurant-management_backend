import Banners from "../models/bannersModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Create Banner
export const createBanner = async (req, res) => {
  try {
    const { mainHead, subHead, status } = req.body;
    const file = req.file?.filename;

    if (!file) return res.status(400).json({ message: "File is required" });

    const banner = await Banners.create({ mainHead, subHead, status, file });
    res.status(201).json({ success: true, banner, message: "Banner Added Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Banners
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banners.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, banners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Banner
export const getBannerById = async (req, res) => {
  try {
    const banner = await Banners.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.status(200).json({ success: true, banner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



export const updateBanner = async (req, res) => {
  try {
    const { mainHead, subHead, status } = req.body;
    const newFile = req.file ? req.file.filename : req.body.file;

    console.log("Update Banner called with:", { mainHead, subHead, status, newFile });

    // Find existing banner
    const existingBanner = await Banners.findById(req.params.id);
    if (!existingBanner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    const updateData = { mainHead, subHead, status };

    if (newFile && newFile !== existingBanner.file) {
      // 🔥 Delete old file
      if (existingBanner.file) {
        let oldFilePath;
        if (process.env.NODE_ENV === 'development') {
          oldFilePath = path.resolve("../my-app/public/assets/images/banner", existingBanner.file);
        } else {
          oldFilePath = path.resolve("https://restaurant-management-f.vercel.app/assets/images/banner", existingBanner.file);

        }

        console.log("Old Image kya hai", oldFilePath)
        fs.access(oldFilePath, fs.constants.F_OK, err => {
          if (!err) {
            fs.unlink(oldFilePath, err => {
              if (err) console.error("Old banner deletion error:", err);
              else console.log("Old banner deleted successfully.");
            });
          } else {
            console.warn("Old banner not found, nothing to delete.");
          }
        });
      }

      // ✅ Save new file
      updateData.file = newFile;
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

    if (banner.file) {
      // const filePath = path.resolve( __dirname,"../my-app/public/assets/images/banner", banner.file );
      let filePath;
        if (process.env.NODE_ENV === 'development') {
          filePath = path.resolve( __dirname,"../my-app/public/assets/images/banner", banner.file );
        } else {
          filePath = path.resolve( __dirname,"https://restaurant-management-f.vercel.app/assets/images/banner", banner.file);

        }

      fs.access(filePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting banner image:", err);
            else console.log("Banner image deleted successfully.");
          });
        } else {
          console.warn("Banner image not found, nothing to delete.");
        }
      });
    }

    await Banners.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBanner:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};