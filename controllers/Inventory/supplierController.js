import Supplier from "../../models/Inventory/Supplier.js";


// export const createSupplier = async (req, res) => {
//   try {
//     const { name, phone, email, address, gstNumber, panNumber, paymentTerms, bankDetails } = req.body;
//     const restaurantId = req.user.restaurant || req.body.restaurant;
    
//     if (!restaurantId) {
//       return res.status(400).json({ message: "Restaurant ID is required" });
//     }
    
//     if (!name) {
//       return res.status(400).json({ success: false, message: "Name is required" });
//     }

//     const existing = await Supplier.findOne({ name, restaurant: restaurantId });
//     if (existing) {
//       return res.status(400).json({ success: false, message: "Supplier already exists" });
//     }

//     const supplier = await Supplier.create({
//       restaurant: restaurantId,
//       name,
//       phone,
//       email,
//       address,
//       gstNumber,
//       panNumber,
//       paymentTerms,
//       bankDetails
//     });

//     res.status(201).json({ success: true, data: supplier });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// export const getAllSuppliers = async (req, res) => {
//   try {
//     const restaurantId = req.user.restaurant || req.body.restaurant;
    
//     if (!restaurantId) {
//       return res.status(400).json({ message: "Restaurant ID is required" });
//     }
    
//     const suppliers = await Supplier.find({ isActive: true, restaurant: restaurantId }).sort({ createdAt: -1 });

//     res.status(200).json({ success: true, data: suppliers });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// export const updateSupplier = async (req, res) => {
//   try {
//     const supplier = await Supplier.findById(req.params.id);

//     if (!supplier) {
//       return res.status(404).json({ success: false, message: "Supplier not found" });
//     }

//     Object.assign(supplier, req.body);
//     await supplier.save();

//     res.status(200).json({ success: true, data: supplier });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// export const deleteSupplier = async (req, res) => {
//   try {
//     const supplier = await Supplier.findById(req.params.id);

//     if (!supplier) {
//       return res.status(404).json({ success: false, message: "Supplier not found" });
//     }

//     supplier.isActive = false;
//     await supplier.save();

//     res.status(200).json({ success: true, message: "Supplier deleted" });

//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };





export const createSupplier = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const { name, phone, email, address, gstNumber, panNumber, paymentTerms, bankDetails } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const existing = await Supplier.findOne({
      restaurant: restaurantId,
      name: { $regex: new RegExp(`^${name}$`, "i") }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Supplier already exists" });
    }

    const supplier = await Supplier.create({
      restaurant: restaurantId,
      name,
      phone,
      email,
      address,
      gstNumber,
      panNumber,
      paymentTerms,
      bankDetails
    });

    res.status(201).json({ success: true, data: supplier });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllSuppliers = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const suppliers = await Supplier.find({
      restaurant: restaurantId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: suppliers });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const supplier = await Supplier.findOne({
      _id: req.params.id,
      restaurant: restaurantId
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    Object.assign(supplier, req.body);
    await supplier.save();

    res.status(200).json({ success: true, data: supplier });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const supplier = await Supplier.findOne({
      _id: req.params.id,
      restaurant: restaurantId
    });

    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    supplier.isActive = false;
    await supplier.save();

    res.status(200).json({ success: true, message: "Supplier deleted" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};