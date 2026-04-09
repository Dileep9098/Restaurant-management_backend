import Category from "../models/categoryModel.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Category
export const createCategory = async (req, res) => {
    try {
        if (!req.user || !req.user.restaurant) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { name, description, isVeg, isNonVeg, isActive, sortOrder, slug } = req.body;
        let imageUrl = null;

        if (req.file) {
            // Upload to Cloudinary from buffer (memory storage)
            const result = await cloudinary.uploader.upload(
                `data:image/jpeg;base64,${req.file.buffer.toString('base64')}`, {
                folder: "categories",
                resource_type: "image"
            });
            imageUrl = result.secure_url;
            console.log("Category image uploaded to Cloudinary:", imageUrl);
        }

        const category = new Category({
            name,
            description,
            isVeg,
            isNonVeg,
            isActive,
            sortOrder,
            restaurant: req.user.restaurant,
            createdBy: req.user._id,
            slug,
            image: imageUrl
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category
        });
    } catch (error) {
        // Handle duplicate category name error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists for this restaurant"
            });
        }
    }
};

// Get All Categories for user's restaurant
export const getAllCategories = async (req, res) => {
    try {
        if (!req.user || !req.user.restaurant) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const categories = await Category.find({ restaurant: req.user.restaurant }).sort({ sortOrder: 1 });

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists for this restaurant"
            });
        }


    }
};

// Get Single Category
export const getSingleCategory = async (req, res) => {
    try {
        if (!req.user || !req.user.restaurant) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const category = await Category.findOne({
            _id: req.params.id,
            restaurant: req.user.restaurant
        });

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {

        return res.status(400).json({
            success: false,
            message: "Category name already exists for this restaurant"
        });
    }
};

// Update Category
// export const updateCategory = async (req, res) => {
//     try {
//         if (!req.user || !req.user.restaurant) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const { name, description, isVeg, isNonVeg, isActive, sortOrder,slug } = req.body;

//         const category = await Category.findOneAndUpdate(
//             { _id: req.params.id, restaurant: req.user.restaurant },
//             { name, description, isVeg, isNonVeg, isActive, sortOrder,slug },
//             { new: true }
//         );

//         if (!category) {
//             return res.status(404).json({ success: false, message: "Category not found" });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Category updated successfully",
//             data: category
//         });
//     } catch (error) {
//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Category name already exists for this restaurant"
//             });
//         }
//     }
// };

// Delete Category

// export const deleteCategory = async (req, res) => {
//     try {
//         if (!req.user || !req.user.restaurant) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const category = await Category.findOneAndDelete({
//             _id: req.params.id,
//             restaurant: req.user.restaurant
//         });

//         if (!category) {
//             return res.status(404).json({ success: false, message: "Category not found" });
//         }

//         res.status(200).json({
//             success: true,
//             message: "Category deleted successfully"
//         });
//     } catch (error) {
//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Category name already exists for this restaurant"
//             });

//         }
//     }
// };



export const updateCategory = async (req, res) => {
    try {
        if (!req.user || !req.user.restaurant) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { name, description, isVeg, isNonVeg, isActive, sortOrder, slug } = req.body;

        const category = await Category.findOne({
            _id: req.params.id,
            restaurant: req.user.restaurant
        });

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // 🔥 IMAGE UPDATE FIX
        if (req.file) {

            const oldImage = category.image; // ✅ pehle store karo

            const result = await cloudinary.uploader.upload(
                `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`,
                {
                    folder: "categories",
                    resource_type: "image"
                }
            );

            category.image = result.secure_url;

            console.log("New category image uploaded:", result.secure_url);

            // ✅ OLD IMAGE DELETE (correct way)
            if (oldImage && oldImage.includes("cloudinary")) {
                try {
                    const parts = oldImage.split("/");
                    const fileName = parts.pop().split(".")[0]; // abc123
                    const folder = parts.slice(-1)[0]; // categories

                    const publicId = `${folder}/${fileName}`;

                    await cloudinary.uploader.destroy(publicId);

                    console.log("Old image deleted:", publicId);
                } catch (err) {
                    console.warn("Delete failed:", err);
                }
            }
        }

        // 🔥 SAFE UPDATE (undefined overwrite na ho)
        category.name = name ?? category.name;
        category.description = description ?? category.description;
        category.isVeg = isVeg ?? category.isVeg;
        category.isNonVeg = isNonVeg ?? category.isNonVeg;
        category.isActive = isActive ?? category.isActive;
        category.sortOrder = sortOrder ?? category.sortOrder;
        category.slug = slug ?? category.slug;

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category
        });

    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Category name already exists for this restaurant"
            });
        }

        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        if (!req.user || !req.user.restaurant) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const category = await Category.findOne({
            _id: req.params.id,
            restaurant: req.user.restaurant
        });

        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // 🔥 DELETE IMAGE FIX
        if (category.image && category.image.includes("cloudinary")) {
            try {
                const parts = category.image.split("/");
                const fileName = parts.pop().split(".")[0];
                const folder = parts.slice(-1)[0];

                const publicId = `${folder}/${fileName}`;

                await cloudinary.uploader.destroy(publicId);

                console.log("Image deleted:", publicId);
            } catch (err) {
                console.warn("Delete failed:", err);
            }
        }

        await Category.deleteOne({ _id: category._id });

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};








// import Category from "../models/categoryModel.js";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Create Category
// export const createCategory = async (req, res) => {
//     try {
//         if (!req.user || !req.user.restaurant) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const { name, description, isVeg, isNonVeg, isActive, sortOrder, slug } = req.body;
//         let image = null;
//         if (req.file) {
//             image = `${req.file.filename}`;
//         }


//         const category = new Category({
//             name,
//             description,
//             isVeg,
//             isNonVeg,
//             isActive,
//             sortOrder,
//             restaurant: req.user.restaurant,
//             createdBy: req.user._id,
//             slug,
//             image
//         });

//         await category.save();

//         res.status(201).json({
//             success: true,
//             message: "Category created successfully",
//             data: category
//         });
//     } catch (error) {
//         // Handle duplicate category name error
//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Category name already exists for this restaurant"
//             });
//         }
//     }
// };

// // Get All Categories for user's restaurant
// export const getAllCategories = async (req, res) => {
//     try {
//         if (!req.user || !req.user.restaurant) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const categories = await Category.find({ restaurant: req.user.restaurant }).sort({ sortOrder: 1 });

//         res.status(200).json({
//             success: true,
//             data: categories
//         });
//     } catch (error) {
//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Category name already exists for this restaurant"
//             });
//         }


//     }
// };

// // Get Single Category
// export const getSingleCategory = async (req, res) => {
//     try {
//         if (!req.user || !req.user.restaurant) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const category = await Category.findOne({
//             _id: req.params.id,
//             restaurant: req.user.restaurant
//         });

//         if (!category) {
//             return res.status(404).json({ success: false, message: "Category not found" });
//         }

//         res.status(200).json({
//             success: true,
//             data: category
//         });
//     } catch (error) {

//         return res.status(400).json({
//             success: false,
//             message: "Category name already exists for this restaurant"
//         });
//     }
// };

// export const deleteCategory = async (req, res) => {
//     try {
//         if (!req.user || !req.user.restaurant) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const category = await Category.findOne({
//             _id: req.params.id,
//             restaurant: req.user.restaurant
//         });

//         if (!category) {
//             return res.status(404).json({ success: false, message: "Category not found" });
//         }

//         if (category.image) {
//             // const imagePath = path.resolve("../my-app/public/assets/images/categories", category.image);
//             // let imagePath;
//             // if (process.env.NODE_ENV === 'development') {
//             //     imagePath = path.resolve("../my-app/public/assets/images/categories", category.image);
//             // } else {
//             //     imagePath = path.resolve("https://restaurant-management-f.vercel.app/assets/images/categories", category.image);
//             // }
//             const imagePath = path.resolve(__dirname, "../uploads/categories", category.image);

//             if (fs.existsSync(imagePath)) {
//                 fs.unlink(imagePath, (err) => {
//                     if (err) {
//                         console.error("Image delete error:", err);
//                     } else {
//                         console.log("Category image deleted:", imagePath);
//                     }
//                 });
//             }
//         }

//         // 🔥 Ab DB se category delete karo
//         await Category.deleteOne({ _id: category._id });

//         res.status(200).json({
//             success: true,
//             message: "Category deleted successfully"
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Server Error"
//         });
//     }
// };


// export const updateCategory = async (req, res) => {
//     try {
//         if (!req.user || !req.user.restaurant) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         const { name, description, isVeg, isNonVeg, isActive, sortOrder, slug } = req.body;

//         // Pehle category find karlo
//         const category = await Category.findOne({ _id: req.params.id, restaurant: req.user.restaurant });

//         if (!category) {
//             return res.status(404).json({ success: false, message: "Category not found" });
//         }

//         // Agar new image upload hui hai
//         if (req.file) {
//             if (category.image) {
//                 // const oldImagePath = path.resolve("../my-app/public/assets/images/categories", category.image);
//                 let oldImagePath;
//                 // if (process.env.NODE_ENV === 'development') {
//                 //     oldImagePath = path.resolve("../my-app/public/assets/images/categories", category.image);
//                 // } else {
//                 //     oldImagePath = path.resolve("https://restaurant-management-f.vercel.app/assets/images/categories", category.image);
//                 // }
//                 oldImagePath = path.resolve(__dirname, "../uploads/categories", category.image);


//                 console.log("Old Image Kya hai", oldImagePath)

//                 if (fs.existsSync(oldImagePath)) {
//                     fs.unlink(oldImagePath, (err) => {
//                         if (err) console.error("Error deleting old image:", err);
//                         else console.log("Old image deleted:", oldImagePath);
//                     });
//                 }
//             }

//             // New image ka filename save karo
//             category.image = req.file.filename;
//         }

//         // Baaki fields update karo
//         category.name = name;
//         category.description = description;
//         category.isVeg = isVeg;
//         category.isNonVeg = isNonVeg;
//         category.isActive = isActive;
//         category.sortOrder = sortOrder;
//         category.slug = slug;

//         await category.save();

//         res.status(200).json({
//             success: true,
//             message: "Category updated successfully",
//             data: category
//         });
//     } catch (error) {
//         console.error(error);
//         if (error.code === 11000) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Category name already exists for this restaurant"
//             });
//         }
//         res.status(500).json({ success: false, message: "Server Error" });
//     }
// };
