import DineInTable from '../../models/POS/DineInTable.js';
import POSOrder from '../../models/POS/POSOrder.js';

// Get all dine-in tables
export const getAllTables = async (req, res) => {
  try {
    const { status, location } = req.query;
    const restaurantId = req.user.restaurant;

    const query = { 
      restaurant: restaurantId,
      isActive: true 
    };

    if (status) query.status = status;
    if (location) query.location = new RegExp(location, 'i');

    const tables = await DineInTable.find(query)
      .populate('currentOrder', 'orderNumber status totalAmount')
      .sort({ tableNumber: 1 });

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

// Get table by ID
export const getTableById = async (req, res) => {
  try {
    const table = await DineInTable.findOne({
      _id: req.params.id,
      restaurant: req.user.restaurant
    })
    .populate('currentOrder', 'orderNumber status totalAmount items');

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      data: table
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new table
export const createTable = async (req, res) => {
  try {
    const {
      tableNumber,
      capacity,
      location,
      status = 'available'
    } = req.body;

    const restaurantId = req.user.restaurant;

    // Check if table number already exists
    const existingTable = await DineInTable.findOne({
      restaurant: restaurantId,
      tableNumber: tableNumber.toUpperCase()
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: 'Table number already exists'
      });
    }

    const table = await DineInTable.create({
      restaurant: restaurantId,
      tableNumber: tableNumber.toUpperCase(),
      capacity,
      location,
      status,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: table
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update table
export const updateTable = async (req, res) => {
  try {
    const {
      tableNumber,
      capacity,
      location,
      status
    } = req.body;

    const restaurantId = req.user.restaurant;

    // Check if table number already exists (excluding current table)
    if (tableNumber) {
      const existingTable = await DineInTable.findOne({
        restaurant: restaurantId,
        tableNumber: tableNumber.toUpperCase(),
        _id: { $ne: req.params.id }
      });

      if (existingTable) {
        return res.status(400).json({
          success: false,
          message: 'Table number already exists'
        });
      }
    }

    const table = await DineInTable.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId },
      {
        ...(tableNumber && { tableNumber: tableNumber.toUpperCase() }),
        ...(capacity && { capacity }),
        ...(location && { location }),
        ...(status && { status }),
        updatedBy: req.user._id
      },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      message: 'Table updated successfully',
      data: table
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update table status
export const updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const restaurantId = req.user.restaurant;

    const table = await DineInTable.findOneAndUpdate(
      { _id: req.params.id, restaurant: restaurantId },
      { 
        status,
        updatedBy: req.user._id,
        // Clear current order if table becomes available
        ...(status === 'available' && { currentOrder: null })
      },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.json({
      success: true,
      message: 'Table status updated successfully',
      data: table
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete table
export const deleteTable = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const table = await DineInTable.findOneAndDelete({
      _id: req.params.id,
      restaurant: restaurantId
    });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    // Check if table has active order
    if (table.currentOrder) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete table with active order'
      });
    }

    res.json({
      success: true,
      message: 'Table deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reserve table
export const reserveTable = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      expectedTime
    } = req.body;

    const restaurantId = req.user.restaurant;

    const table = await DineInTable.findOneAndUpdate(
      { 
        _id: req.params.id,
        restaurant: restaurantId,
        status: 'available'
      },
      {
        status: 'reserved',
        reservedBy: {
          customerName,
          customerPhone,
          reservationTime: new Date(),
          expectedTime: new Date(expectedTime)
        },
        updatedBy: req.user._id
      },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not available for reservation'
      });
    }

    res.json({
      success: true,
      message: 'Table reserved successfully',
      data: table
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Cancel reservation
export const cancelReservation = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant;

    const table = await DineInTable.findOneAndUpdate(
      { 
        _id: req.params.id,
        restaurant: restaurantId,
        status: 'reserved'
      },
      {
        status: 'available',
        reservedBy: null,
        updatedBy: req.user._id
      },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'No reservation found for this table'
      });
    }

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: table
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
