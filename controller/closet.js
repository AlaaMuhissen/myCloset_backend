import Closet from "../models/closet.schema.js";

export const getUserClothes = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId);
        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(closet);
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
        const itemsArray = Object.values(items);
        
        res.status(200).json(itemsArray);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
