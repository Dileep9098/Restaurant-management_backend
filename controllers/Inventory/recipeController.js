// import Recipe from "../models/Recipe.js";
// import InventoryTransaction from "../models/InventoryTransaction.js";
// import InventorySetting from "../models/InventorySetting.js";
import InventorySetting from "../../models/Inventory/InventorySetting.js";
import InventoryTransaction from "../../models/Inventory/InventoryTransaction.js";
import Recipe from "../../models/Inventory/Recipe.js";


export const getAllRecipes = async (req, res) => {
  try {
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const recipes = await Recipe.find({ restaurant: restaurantId })
      .populate('menuItem', 'name')
      .populate('ingredients.rawMaterial', 'name purchaseUnit consumptionUnit');
    
    res.json({ success: true, data: recipes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const recipe = await Recipe.findOne({ _id: id, restaurant: restaurantId })
      .populate('menuItem', 'name')
      .populate('ingredients.rawMaterial', 'name purchaseUnit consumptionUnit');
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    
    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const { menuItem, ingredients } = req.body;
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }
    
    if (!menuItem || !ingredients?.length) {
      return res.status(400).json({ message: "MenuItem and ingredients are required" });
    }

    const recipe = await Recipe.findOneAndUpdate(
      { _id: id, restaurant: restaurantId },
      { menuItem, ingredients },
      { new: true, runValidators: true }
    ).populate('menuItem', 'name')
     .populate('ingredients.rawMaterial', 'name purchaseUnit consumptionUnit');
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    
    res.json({ success: true, data: recipe });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurantId = req.user.restaurant || req.body.restaurant;
    
    if (!restaurantId) {
      return res.status(400).json({ message: "Restaurant ID is required" });
    }

    const recipe = await Recipe.findOneAndDelete({ _id: id, restaurant: restaurantId });
    
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    
    res.json({ success: true, message: "Recipe deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

      // Check current stock (reuse logic similar to getCurrentStock, accounting for unit conversion)
      const transactions = await InventoryTransaction.find({
        rawMaterial: ingredient.rawMaterial,
        restaurant: restaurantId
      }).populate("rawMaterial", "conversionRate purchaseUnit consumptionUnit");

      let stock = 0;

      transactions.forEach(t => {
        let qty = Number(t.quantity) || 0;
        const mat = t.rawMaterial;
        if (t.unit && mat && mat.conversionRate) {
          if (t.unit === "purchase") {
            qty = qty * mat.conversionRate;
          }
        }

        if (t.type === "PURCHASE" || t.type === "IN" || t.type === "TRANSFER_IN") stock += qty;
        if (
          t.type === "SALE_DEDUCTION" || t.type === "OUT" ||
          t.type === "WASTAGE" || t.type === "TRANSFER_OUT" ||
          t.type === "PURCHASE_RETURN"
        ) stock -= qty;
        if (t.type === "ADJUSTMENT") stock += qty;
      });

      if (!settings.allowNegativeStock && stock < requiredQty) {
        throw new Error("Insufficient stock");
      }

      await InventoryTransaction.create({
        restaurant: restaurantId,
        rawMaterial: ingredient.rawMaterial,
        type: "SALE_DEDUCTION", // use sale deduction for consistency
        quantity: requiredQty,
        unit: 'consumption',
        referenceId,
        referenceModel: "Order"
      });
    }

  } catch (error) {
    throw error;
  }
};