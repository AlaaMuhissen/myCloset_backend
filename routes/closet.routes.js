import { Router } from "express";
import { getUserClothes ,getUserSubCategoryItems } from "../controller/closet.js";

const router = Router();

// Get a specific closet items by ID (All the categories)
router.get("/:userId", getUserClothes);

router.get("/:userId/:category/:subCategory" , getUserSubCategoryItems)

export default router;