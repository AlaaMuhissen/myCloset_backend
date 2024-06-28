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

function filterItems(data, filters, subCategoriesArray) {
    const matchedItems = [];

    function checkItem(item, filters) {
        console.log("item ==> " , item)
        console.log("filter ==> " , filters)
        const colorMatch = !filters.colors || filters.colors.every(color => item.colors.includes(color));
        const seasonMatch = !filters.seasons || filters.seasons.every((bit, index) => bit === 0 || (item.seasons && item.seasons[index] === 1));
        const tagsMatch = !filters.tags || filters.tags.every(tag => item.tags.includes(tag));
        const fabricMatch = !filters.fabric || filters.fabric === item.fabric;

        return colorMatch && seasonMatch && tagsMatch && fabricMatch;
    }

    function traverseItems(itemsMap, filters) {
        if (itemsMap instanceof Map) {
            console.log("itemsMap ==> " , itemsMap)
            itemsMap.forEach((item, key) => {
                if (checkItem(item, filters)) {
                    matchedItems.push(item);
                }
            });
        }
    }

    function traverseCategories(categories, filters) {
        console.log(categories)
        for (let category in categories) {
            if (category === '_id') continue; // Skip the _id field

            let subCategories = categories[category];
            if (typeof subCategories !== 'object' || subCategories === null) continue; // Skip non-object subCategories
           
            if(subCategoriesArray.length === 0)
            { for (let subCategory in subCategories) {
                let itemsMap = subCategories[subCategory];
                traverseItems(itemsMap, filters);
            }}
            else{
                for (let subCategory in subCategories) {
                    if (subCategoriesArray.includes(subCategory)) {
                        let itemsMap = subCategories[subCategory];
                        traverseItems(itemsMap, filters);
                    }
                }
            }
        }
    }

    
        traverseCategories(data, filters);
 

    return matchedItems;
}


const buildFilters = ({ colors, seasons, tags, fabric }) => {
    const filters = {};
    if (colors && colors.length > 0) {
      filters.colors = colors;
    }
    if (seasons && seasons.length > 0) {
      filters.seasons = seasons;
    }
    if (tags && tags.length > 0) {
      filters.tags = tags;
    }
    if (fabric && fabric.length > 0) {
      filters.fabric = fabric;
    }
    return filters;
  };
  
export const filterCloset = async (req, res) => {
    console.log("hello")
    const { subCategories, colors, seasons, tags, fabric } = req.body;
    console.log(subCategories, colors, seasons, tags, fabric)
    try {
        // Build the filter object
        const filters = buildFilters({ colors, seasons, tags, fabric });
        console.log(filters);
        // Find all closet documents
        const closets = await Closet.find();

        let filteredItems = [];

        closets.forEach(closet => {
            let items = closet.categories;
            console.log(items)
            const itemsWithFilters = filterItems(items, filters, subCategories);
            filteredItems = filteredItems.concat(itemsWithFilters);
        });

        res.status(200).json(filteredItems);
    } catch (error) {
        console.error("error", error)
        res.status(500).json({ message: 'Server Error', error });
    }
}


function getColors(data, isThereACategory) {
    const matchedItems = [];

    function traverseItems(itemsMap) {
        if (itemsMap instanceof Map) {
            itemsMap.forEach((item, key) => {
                matchedItems.push(...item.colors); // Spread item.colors into the array
            });
        }
    }

    function traverseCategories(categories) {
        for (let category in categories) {
            if (category === '_id') continue; // Skip the _id field

            let subCategories = categories[category];
            if (typeof subCategories !== 'object' || subCategories === null) continue; // Skip non-object subCategories

            // Loop through sub-categories
            for (let subCategory in subCategories) {
                let itemsMap = subCategories[subCategory];
                traverseItems(itemsMap);
            }
        }
    }

    // Determine if the data is structured as categories or items directly
    if (isThereACategory) {
        for (let subCategory in data) {
            let itemsMap = data[subCategory];
            traverseItems(itemsMap);
        }
    } else {
        traverseCategories(data);
    }

    return matchedItems;
}

export const getClothesColors = async (req, res) => {
    const { category, subCategory } = req.body;
    try {
        // Find all closet documents
        const closets = await Closet.find();
        let allColors = [];

        closets.forEach(closet => {
            let items = closet.categories;

            if (category) {
                items = items[category];
                if (subCategory) {
                    items = items[subCategory];
                }
            }

            if (items) {
                const colors = getColors(items, !!category);
                allColors = allColors.concat(colors);
            }
        });

        // Flatten the nested array and remove duplicates
        const uniqueColors = Array.from(new Set(allColors.flat()));

        res.status(200).json(uniqueColors);
    } catch (error) {
        console.error("error ", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};