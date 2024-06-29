import { Router } from "express";
import { addOutfit, editOutfit, getOutfit ,getAllOutfits , getAllSpecificSeasonOutfits ,getOutfitsNumber ,deleteOutfit ,getOutfitIdsContainingItems } from "../controller/outfit.js";


const router = Router();
router.get("/:userId/outfitsNumber", getOutfitsNumber);
router.post("/:userId/getOutfitIdsContainingItems", getOutfitIdsContainingItems );
router.get("/:userId/", getAllOutfits);
router.get("/:userId/:season", getAllSpecificSeasonOutfits);
router.get("/:userId/:season/:outfitNumber", getOutfit);
router.put("/:userId/:season/:outfitNumber" , editOutfit);
router.post("/:userId/:season/" , addOutfit)
router.delete("/:userId/:season", deleteOutfit);
export default router;