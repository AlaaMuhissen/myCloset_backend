import { Router } from "express";
import { getUserClothes ,getUserSubCategoryItems ,getUserCategoryItems ,getUserSubCategorySpecificItems,addNewClotheItem ,filterCloset ,getClothesColors} from "../controller/closet.js";

const router = Router();

// Get a specific closet items by ID (All the categories)
router.post("/filter/:userId" , filterCloset)
router.get("/getAllColors/:userId" , getClothesColors)
router.get("/:userId", getUserClothes);
router.get("/:userId/:category" , getUserCategoryItems)
router.get("/:userId/:category/:subCategory" , getUserSubCategoryItems)
router.get("/:userId/:category/:subCategory/:itemId" , getUserSubCategorySpecificItems)
router.post("/:userId/:category/:subCategory" , addNewClotheItem)

export default router;