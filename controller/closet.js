import Closet from "../models/closet.schema.js";
import mongoose from "mongoose";
export const getUserClothes = async (req, res) => {
    try {
        const { userId } = req.params;
       
        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(closet);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
export const getUserCategoryItems = async (req, res) => {
    try {
        const { userId , category} = req.params;
       
        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(closet.categories[category]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const getUserSubCategoryItems = async (req, res) => {
    try {
        const { userId, category, subCategory } = req.params;
        const closet = await Closet.findOne({ userId });
        
        if (!closet) {
            return res.status(404).json({ message: "Closet not found" });
        }
        
        const items = closet.categories?.[category]?.[subCategory];
        
        if (!items) {
            return res.status(404).json({ message: "Category or subcategory not found" });
        }

        // Convert nested object to array for easier handling in the response
        // const itemsArray = Object.values(items);
        
        res.status(200).json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const getUserSubCategorySpecificItems = async (req, res) => {
    try {
        const { userId, category, subCategory , itemId } = req.params;
        const closet = await Closet.findOne({ userId });
        
        if (!closet) {
            return res.status(404).json({ message: "Closet not found" });
        }
        
        const item = closet.categories?.[category]?.[subCategory].get(itemId);
        
        if (!item) {
            return res.status(404).json({ message: "Category or subcategory not found" });
        }

        // Convert nested object to array for easier handling in the response
        // const itemsArray = Object.values(items);
        
        res.status(200).json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const addNewClotheItem = async (req, res) => {
    try {
        const { userId, category, subCategory } = req.params;
        const { imgUrl, seasons, colors, fabric ,tags } = req.body;
        console.log(imgUrl, seasons, colors, fabric)
        // Validate input
        if (!imgUrl || !seasons || !colors || !fabric || !tags) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create a new item
        const newItem = {
            _id: new mongoose.Types.ObjectId(),
            imgUrl,
            seasons,
            colors,
            fabric,
            tags
        };
        console.log(newItem)
        // Find the user's closet
        const closet = await Closet.findOne({ userId });

        if (!closet) {
            return res.status(404).json({ message: "Closet not found" });
        }

        // Add the new item to the appropriate category and subcategory
        if (!closet.categories[category]) {
            return res.status(400).json({ message: "Category not found" });
        }
        if (!closet.categories[category][subCategory]) {
            return res.status(400).json({ message: "Subcategory not found" });
        }

        const clotheId = newItem._id;
        // Update the user's closet with the new outfit
        const updatedCloset = await Closet.findOneAndUpdate(
            { userId },
            { 
                $set: {
                    [`categories.${category}.${subCategory}.${clotheId}`]: newItem
                }
            },
            { new: true, upsert: true } // `upsert: true` will create the document if it doesn't exist
        );

        if (!updatedCloset) {
            return res.status(404).json({ message: 'Closet not found' });
        }

        res.status(201).json({ message: 'Outfit added successfully', closet: updatedCloset });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

