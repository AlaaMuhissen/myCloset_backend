import { Router } from "express";
import { addOutfit, editOutfit, getOutfit ,getAllOutfits , getAllSpecificSeasonOutfits} from "../controller/outfit.js";


const router = Router();

router.get("/:userId/", getAllOutfits);
router.get("/:userId/:season", getAllSpecificSeasonOutfits);
router.get("/:userId/:season/:outfitNumber", getOutfit);
router.put("/:userId/:season/:outfitNumber" , editOutfit);
router.post("/:userId/:season/" , addOutfit)

export default router;