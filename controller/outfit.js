import Closet from "../models/closet.schema.js";
import mongoose from "mongoose";
export const getOutfit = async (req, res) => {
    try {
        const { userId, season, outfitNumber } = req.params;

        const closet = await Closet.findOne({ userId });

        if (!closet) {
            return res.status(404).json({ message: "Closet not found" });
        }

        const outfits = closet.outfits[season];
       
        if (!outfits || !outfits.get(outfitNumber)) {
            return res.status(404).json({ message: "Outfit not found" });
        }

        const outfit = outfits.get(outfitNumber);
        res.status(200).json(outfit[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getAllSpecificSeasonOutfits = async (req, res) => {
    try {
        const { userId, season } = req.params;

        const closet = await Closet.findOne({ userId });

        if (!closet) {
            return res.status(404).json({ message: "Closet not found" });
        }

        const outfits = closet.outfits[season];
       
        if (!outfits) {
            return res.status(404).json({ message: "There is no outFits for this season" });
        }
        res.status(200).json(outfits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getAllOutfits = async (req, res) => {
    try {
        const { userId } = req.params;

        const closet = await Closet.findOne({ userId });

        if (!closet) {
            return res.status(404).json({ message: "Closet not found" });
        }

        const outfits = closet.outfits;
       
        if (!outfits) {
            return res.status(404).json({ message: "There is no outFits" });
        }
        res.status(200).json(outfits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
export const editOutfit =  async (req, res) => {
    try {
        const { userId, category, subCategory } = req.params;
        const closet = await Closet.findOne({ userId });
        
        if (!closet) {
            return res.status(404).json({ message: "Closet not found" });
        }
        
        const items = closet.categories[category]?.[subCategory];
        
        if (!items) {
            return res.status(404).json({ message: "Category or subcategory not found" });
        }
        
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const addOutfit = async (req, res) => {
    try {
        const { userId, season } = req.params;
        const { itemsId, colorPalette, sizes, positions } = req.body;

        let closet = await Closet.findOne({ userId });

        if (!closet) {
            closet = new Closet({ userId, categories: {}, outfits: {} });
        }

        const outfitId = new mongoose.Types.ObjectId(); // Generate new ObjectId for the outfit

        // Convert sizes object into an array of size objects
        const formattedSizes = Object.keys(sizes).map(sizeId => ({
            _id: sizeId,
            width: sizes[sizeId].width,
            height: sizes[sizeId].height
        }));

        // Convert positions object into an array of position objects
        const formattedPositions = Object.keys(positions).map(posId => ({
            _id: posId,
            x: positions[posId].x,
            y: positions[posId].y
        }));

        const outfit = {
            _id: outfitId,
            itemsId,
            colorPalette,
            sizes: formattedSizes,
            positions: formattedPositions
        };

        if (!closet.outfits.get(season)) {
            closet.outfits.set(season, new Map());
        }

        closet.outfits.get(season).set(outfitId, outfit); // Use the generated ObjectId as the key

        await closet.save();
        res.status(200).json(closet);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
