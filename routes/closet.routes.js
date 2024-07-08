import { Router } from "express";
import { getUserClothes ,getUserSubCategoryItems ,getUserCategoryItems ,getUserSubCategorySpecificItems,addNewClotheItem ,filterCloset ,getClothesColors ,editClotheItem ,getClothesNumber, deleteClotheItem ,filterAndTransformCloset ,getUserStatistics  ,addNewUser} from "../controller/closet.js";

const router = Router();


router.post("/filter/:userId" , filterCloset)
router.post("/newUser" , addNewUser)
router.get("user-statistics/:userId/:period" , getUserStatistics)
router.post('/filterAndTransformCloset/:userId', filterAndTransformCloset);
router.get("/getAllColors/:userId" , getClothesColors)
router.get("/:userId/clothesNumber", getClothesNumber);
router.get("/:userId", getUserClothes);
router.get("/:userId/:category" , getUserCategoryItems)
router.delete("/:userId/:category/:subCategory" , deleteClotheItem)
router.get("/:userId/:category/:subCategory" , getUserSubCategoryItems)
router.get("/:userId/:category/:subCategory/:itemId" , getUserSubCategorySpecificItems)
router.post("/:userId/:category/:subCategory" , addNewClotheItem)
router.put("/:userId/:category/:subCategory/:itemId" , editClotheItem)


export default router;