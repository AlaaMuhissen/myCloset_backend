import { Router } from "express";
import { addOutfit, editOutfit, getOutfit ,getAllOutfits , getAllSpecificSeasonOutfits ,getOutfitsNumber ,deleteOutfit ,getOutfitIdsContainingItems ,addLogOutfitUsage , getOutfitNumberMadeByAI ,editHistory ,addToFavorite ,deleteFromFavorite ,getFavoriteOutfit ,deleteHistory} from "../controller/outfit.js";


const router = Router();
router.get("/:userId/outfitsNumber", getOutfitsNumber);
router.get("/getOutfitNumberMadeByAI/:userId", getOutfitNumberMadeByAI);
router.get("/getFavoriteOutfit/:userId/:season", getFavoriteOutfit);
router.post("/logOutfitUsage/:userId", addLogOutfitUsage);
router.post("/addToFavorite/:userId", addToFavorite);
router.post("/:userId/getOutfitIdsContainingItems", getOutfitIdsContainingItems );
router.get("/:userId/", getAllOutfits);
router.get("/:userId/:season", getAllSpecificSeasonOutfits);
router.get("/:userId/:season/:outfitNumber", getOutfit);
router.put("/:userId/:season/:outfitNumber" , editOutfit);
router.put("/:userId/:outfitId" , editHistory);
router.post("/:userId/:season/" , addOutfit)
router.delete("/deleteFromFavorite/:userId", deleteFromFavorite);
router.delete("/deleteHistory/:userId", deleteHistory);
router.delete("/:userId/:season", deleteOutfit);
export default router;