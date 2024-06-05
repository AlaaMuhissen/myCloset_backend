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
       
        if (!outfits) {
            return res.status(404).json({ message: "Outfits not found" });
        }
        const outfit = outfits.find(item => item._id.toString() === outfitNumber);

        if (!outfit) {
            return res.status(404).json({ message: "Outfit not found" });
        }

        res.status(200).json(outfit);
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
            return res.status(404).json({ message: "There are no outfits" });
        }
        
        const allOutfits = {};
        for (const season in outfits) {
            allOutfits[season] = [...outfits[season].values()]; // Convert Map values to array
        }
        
        res.status(200).json(allOutfits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const editOutfit = async (req, res) => {
    try {
        const { userId, season, outfitNumber } = req.params;
        const { itemsId, colorPalette, sizes, positions, imgUrl } = req.body;

        const closet = await Closet.findOne({ userId });

        if (!closet) {
            return res.status(404).json({ message: "Closet not found" });
        }

        const outfits = closet.outfits[season];
        
        if (!outfits) {
            return res.status(404).json({ message: "Outfits for this season not found" });
        }

        // Find the outfit by _id
        const outfit = outfits.find(item => item._id.toString() === outfitNumber);

        if (!outfit) {
            return res.status(404).json({ message: "Outfit not found" });
        }

        // Update fields if they exist in the request body
        if (itemsId) outfit.itemsId = itemsId.map(id => new mongoose.Types.ObjectId(id));
        if (colorPalette) outfit.colorPalette = colorPalette;
        if (imgUrl) outfit.imgUrl = imgUrl;

        // Update sizes if provided
        if (sizes) {
            outfit.sizes = sizes.map(size => ({
                _id: new mongoose.Types.ObjectId(size._id), // Ensure each _id is an ObjectId
                width: parseFloat(size.width),
                height: parseFloat(size.height)
            }));
        }

        // Update positions if provided
        if (positions) {
            outfit.positions = positions.map(position => ({
                _id: new mongoose.Types.ObjectId(position._id), // Ensure each _id is an ObjectId
                x: parseFloat(position.x),
                y: parseFloat(position.y)
            }));
        }

        // Save the updated closet
        await closet.save();
        res.status(200).json(outfit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const addOutfit = async (req, res) => {
    try {
        const { userId, season } = req.params;
        const { itemsId, colorPalette, sizes, positions, imgUrl } = req.body;
    
        let closet = await Closet.findOne({ userId });

        if (!closet) {
            closet = new Closet({ 
                _id: new mongoose.Types.ObjectId(),
                userId, 
                categories: {}, 
                outfits: { Summer: [], Winter: [] } 
            });
        }

        const outfitId = new mongoose.Types.ObjectId(); // Generate new ObjectId for the outfit

        // Convert sizes object into an array of size objects with ObjectId
        const formattedSizes = sizes.map(size => ({
            _id: new mongoose.Types.ObjectId(size._id), // Ensure each _id is an ObjectId
            width: parseFloat(size.width),
            height: parseFloat(size.height)
        }));

        // Convert positions object into an array of position objects with ObjectId
        const formattedPositions = positions.map(position => ({
            _id: new mongoose.Types.ObjectId(position._id), // Ensure each _id is an ObjectId
            x: parseFloat(position.x),
            y: parseFloat(position.y)
        }));

        const outfit = {
            _id: outfitId,
            itemsId: itemsId.map(id => new mongoose.Types.ObjectId(id)), // Ensure each itemId is an ObjectId
            colorPalette,
            sizes: formattedSizes,
            positions: formattedPositions,
            imgUrl
        };

        if (!closet.outfits[season]) {
            closet.outfits[season] = [];
        }

        closet.outfits[season].push(outfit); // Add the new outfit to the array

        await closet.save();
        res.status(200).json(closet.outfits[season]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};