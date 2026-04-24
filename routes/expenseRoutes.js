import express from "express";
import {createExpense,getAllExpenses,getExpenseById,updateExpense,deleteExpense,getExpenseSummary
} from "../controllers/expenseController.js";
import auth from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });



router.post("/expense", auth,upload.single("billImage"),createExpense);


router.get("/expense", auth,getAllExpenses);

router.get("/expense/summary", auth,getExpenseSummary);

router.get("/expense/:id", auth,getExpenseById);


router.put("/expense/:id", auth,upload.single("billImage"),updateExpense);

router.delete("/expense/:id", auth,deleteExpense);

export default router;
