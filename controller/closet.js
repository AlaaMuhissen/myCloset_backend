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

function filterItems(data, filters ,isThereACategory) {
    const matchedItems = [];

    function checkItem(item, filters) {
        console.log(`item is ${item} and the filter is ${filters.fabric}`)
        const colorMatch = !filters.colors || filters.colors.every(color => item.colors.includes(color));
        // Check if all bits set in filters.seasons are also set in item.seasons
        const seasonMatch = !filters.seasons || filters.seasons.every((bit, index) => bit === 0 || (item.seasons && item.seasons[index] === 1));
        const tagsMatch = !filters.tags || filters.tags.every(tag => item.tags.includes(tag));
        const fabricMatch = !filters.fabric || filters.fabric === item.fabric;
        console.log(`fabricMatch ${fabricMatch}`)
        return colorMatch && seasonMatch && tagsMatch && fabricMatch;
    }

    function traverseItems(data, filters) {
        console.log(filters)
        for (const subCategory in data) {
            const itemsMap = data[subCategory];
            if (itemsMap instanceof Map) {
              itemsMap.forEach((item, key) => {
                if (checkItem(item, filters)) {
                    matchedItems.push(item);
                }
              });
            }
          }
    }

    function traverseCategories(categories, filters) {
        for (let category in categories) {
            if (category === '_id') continue; // Skip the _id field

            let subCategories = categories[category];
           
            // Loop through sub-categories
            for (let subCategory in subCategories) {
               
                let itemsMap = subCategories[subCategory];
                traverseItems(itemsMap, filters);
            }
        }
    }

    // Determine if the data is structured as categories or items directly
    if (isThereACategory) {
        traverseItems(data, filters);
    } else {
        traverseCategories(data, filters);
    }

    return matchedItems;
}

export const filterCloset = async (req, res) => {
    const { category, subCategory, colors, seasons, tags, fabric } = req.body;
    try {
        // Build the filter object
        const filters = { colors, seasons, tags, fabric };

        // Find all closet documents
        const closets = await Closet.find();
        let isThereACategory = false;
        let filteredItems = [];

        closets.forEach(closet => {
            let items = closet.categories;

            if (category) {
                items = items[category];
                isThereACategory = true;
                if (subCategory) {
                    items = items[subCategory];
                }
            }

            if (items) {
                const itemsWithFilters = filterItems(items, filters ,isThereACategory);
                filteredItems = filteredItems.concat(itemsWithFilters);
            }
        });

        res.status(200).json(filteredItems);
    } catch (error) {
        console.error('error ' , error)
        res.status(500).json({ message: 'Server Error', error });
    }
}