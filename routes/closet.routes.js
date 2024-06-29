import { Router } from "express";
import { getUserClothes ,getUserSubCategoryItems ,getUserCategoryItems ,getUserSubCategorySpecificItems,addNewClotheItem ,filterCloset ,getClothesColors ,editClotheItem ,getClothesNumber} from "../controller/closet.js";

const router = Router();

// Get a specific closet items by ID (All the categories)
router.post("/filter/:userId" , filterCloset)
router.get("/getAllColors/:userId" , getClothesColors)
router.get("/:userId/clothesNumber", getClothesNumber);
router.get("/:userId", getUserClothes);
router.get("/:userId/:category" , getUserCategoryItems)
router.get("/:userId/:category/:subCategory" , getUserSubCategoryItems)
router.get("/:userId/:category/:subCategory/:itemId" , getUserSubCategorySpecificItems)
router.post("/:userId/:category/:subCategory" , addNewClotheItem)
router.put("/:userId/:category/:subCategory/:itemId" , editClotheItem)

export default router;