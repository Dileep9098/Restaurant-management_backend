import Table from "../models/tableModel.js";
import {  generateStyledQR, } from "../utils/generateQRCode.js";
import Restaurant from "../models/restaurentModel.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// export const createTable = async (req, res) => {
//     try {
//         const { restaurant, tableNumber, capacity } = req.body;

//         if (!restaurant || !tableNumber) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Restaurant and Table Number are required"
//             });
//         }

//         const table = await Table.create({
//             restaurant,
//             tableNumber,
//             capacity
//         });

//         res.status(201).json({
//             success: true,
//             message: "Table created successfully",
//             data: table
//         });

//     } catch (error) {
//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Table number already exists for this restaurant"
//             });
//         }

//         res.status(500).json({
//             success: false,
//             message: error.message
//         });
//     }
// };

export const createTable = async (req, res) => {
  try {
    const { restaurant, tableNumber,capacity,qrColorPreset,status,
} = req.body;

    const table = await Table.create({
      restaurant,
      tableNumber,capacity,qrColorPreset,status,
    });

    const restaurantData = await Restaurant.findById(restaurant);
    console.log("Restaurant data:", restaurantData);

    const qrUrl = `${process.env.FRONTEND_URL}/menu?restaurant=${restaurant}&table=${table._id}`;

    // Use Cloudinary URL directly if available, otherwise use restaurant name
    let logoPath = restaurantData.name; // default fallback
    if (restaurantData.logo && 
        restaurantData.logo !== "resLogo.png" && 
        typeof restaurantData.logo === 'string' && 
        restaurantData.logo.includes("cloudinary")) {
      logoPath = restaurantData.logo; // Use Cloudinary URL directly
    }

    const qrCode = await generateStyledQR({
      url: qrUrl,
      logoPath: logoPath,
      darkColor: "#6B21A8"
    });

    table.qrCodeUrl = qrCode;
    await table.save();

    res.json({
      success: true,
      message: "Table QR created with restaurant logo",
      data: table
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getTablesByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const tables = await Table.find({
            restaurant: restaurantId,
            isActive: true
        }).sort({ tableNumber: 1 });

        res.json({
            success: true,
            data: tables
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateTableStatus = async (req, res) => {
    try {
        const { tableId } = req.params;
        const { status } = req.body;

        if (!["free", "occupied", "reserved"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid table status"
            });
        }

        const table = await Table.findByIdAndUpdate(
            tableId,
            { status },
            { new: true }
        );

        res.json({
            success: true,
            message: "Table status updated",
            data: table
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Updating table with ID:", req.params);
        const updateData = req.body;

        // Optional: status validation
        if (
            updateData.status &&
            !["free", "occupied", "reserved"].includes(updateData.status)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid table status"
            });
        }

        const table = await Table.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Table not found"
            });
        }

        res.json({
            success: true,
            message: "Table updated successfully",
            data: table
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteTable = async (req, res) => {
    try {
        const { tableId } = req.params;

        await Table.findByIdAndUpdate(tableId, {
            isActive: false
        });

        res.json({
            success: true,
            message: "Table deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
