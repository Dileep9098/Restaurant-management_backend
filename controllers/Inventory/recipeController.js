// import Recipe from "../models/Recipe.js";
// import InventoryTransaction from "../models/InventoryTransaction.js";
// import InventorySetting from "../models/InventorySetting.js";
import InventorySetting from "../../models/Inventory/InventorySetting.js";
import InventoryTransaction from "../../models/Inventory/InventoryTransaction.js";
import Recipe from "../../models/Inventory/Recipe.js";


export const createRecipe = async (req, res) => {
  try {
    const { menuItem, ingredients } = req.body;
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    
    if (!menuItem || !ingredients?.length) {
      return res.status(400).json({ message: "MenuItem and ingredients are required" });
    }

    const recipe = await Recipe.create({
      restaurant: restaurantId,
      menuItem,
      ingredients
    });
    
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deductStockForMenuItem = async (menuItemId, quantityOrdered, referenceId, restaurantId) => {
  try {
    if (!restaurantId) {
      throw new Error("Restaurant ID is required");
    }
    
    const settings = await InventorySetting.findOne({ restaurant: restaurantId });

    if (!settings?.autoDeductInventory) return;

    const recipe = await Recipe.findOne({ menuItem: menuItemId, restaurant: restaurantId });

    if (!recipe) return;

    for (const ingredient of recipe.ingredients) {

      const requiredQty = ingredient.quantityRequired * quantityOrdered;

      // Check current stock (reuse logic similar to getCurrentStock)
      const transactions = await InventoryTransaction.find({
        rawMaterial: ingredient.rawMaterial,
        restaurant: restaurantId
      });

      let stock = 0;

      transactions.forEach(t => {
        if (t.type === "PURCHASE" || t.type === "IN" || t.type === "TRANSFER_IN") stock += t.quantity;
        if (
          t.type === "SALE_DEDUCTION" || t.type === "OUT" ||
          t.type === "WASTAGE" || t.type === "TRANSFER_OUT" ||
          t.type === "PURCHASE_RETURN"
        ) stock -= t.quantity;
        if (t.type === "ADJUSTMENT") stock += t.quantity;
      });

      if (!settings.allowNegativeStock && stock < requiredQty) {
        throw new Error("Insufficient stock");
      }

      await InventoryTransaction.create({
        restaurant: restaurantId,
        rawMaterial: ingredient.rawMaterial,
        type: "SALE_DEDUCTION", // use sale deduction for consistency
        quantity: requiredQty,
        referenceId,
        referenceModel: "Order"
      });
    }

  } catch (error) {
    throw error;
  }
};