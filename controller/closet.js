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

export const getClothesNumber = async (req, res) => {
    try {
        const { userId } = req.params;
       
        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({clothesNumber : closet.clothesNumber});
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

export const deleteClotheItem = async (req, res) => {
    try {
        const { userId,category, subCategory  } = req.params;
        const { itemsId } = req.body; //clothe items ids

        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "Item not found" });

        const items = closet.categories?.[category]?.[subCategory];
        if (!items) {
            return res.status(404).json({ message: "There are no outfits" });
        }
        
        // Iterate over itemsId and delete the corresponding entries from the outfits map
        itemsId.forEach(id => {
            if (items.has(id)) {
                items.delete(id);
            }
        });
      
        const deletedCount = itemsId.length
        const updatedCloset = await Closet.findOneAndUpdate(
            { userId },
            {
                $set: { [`categories.${category}.${subCategory}`]: items },
                $inc: { clothesNumber: -deletedCount }
            },
            { new: true }
        );
     
        if (!updatedCloset) {
            return res.status(404).json({ message: "Closet not found" });
        }

        res.status(200).json({ message: 'Clothes deleted successfully', closet: updatedCloset });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

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
                },
                  $inc: { clothesNumber: 1 }
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

export const editClotheItem = async (req, res) => {
    try {
        const { userId, category, subCategory ,itemId} = req.params;
        const { seasons, colors, fabric ,tags } = req.body;
       
        let updateObject = {};

    
        if (seasons) {
            updateObject[`categories.${category}.${subCategory}.${itemId}.seasons`] = seasons;
        }
        if (colors) {
            updateObject[`categories.${category}.${subCategory}.${itemId}.colors`] = colors;
        }
        if (fabric) {
            updateObject[`categories.${category}.${subCategory}.${itemId}.fabric`] = fabric;
        }
        if (tags) {
            updateObject[`categories.${category}.${subCategory}.${itemId}.tags`] = tags;
        }

        // Update the outfit in the user's closet
        const updatedItem = await Closet.findOneAndUpdate(
            { userId },
            { $set: updateObject },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Closet not found' });
        }

        const updatedOutfit = updatedItem.categories[category][subCategory].get(itemId);
      
        if (!updatedOutfit) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(updatedOutfit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
function filterItems(data, filters, subCategoriesArray) {
    const matchedItems = [];

    function checkItem(item, filters) {
        const colorMatch = !filters.colors || filters.colors.every(color => item.colors.includes(color));
        const seasonMatch = !filters.seasons || filters.seasons.every((bit, index) => bit === 0 || (item.seasons && item.seasons[index] === 1));
        const tagsMatch = !filters.tags || filters.tags.every(tag => item.tags.includes(tag));
        const fabricMatch = !filters.fabric || filters.fabric === item.fabric;

        return colorMatch && seasonMatch && tagsMatch && fabricMatch;
    }

    function traverseItems(itemsMap, filters , category, subCategory) {
        if (itemsMap instanceof Map) {
            itemsMap.forEach((item, key) => {
                if (checkItem(item, filters)) {
                    matchedItems.push({ ...item, category, subCategory });
                }
            });
        }
    }

  
   

    function traverseCategories(categories, filters) {
        for (let category in categories) {
            if (category === '_id') continue; // Skip the _id field

            let subCategories = categories[category];
            if (typeof subCategories !== 'object' || subCategories === null) continue; // Skip non-object subCategories
           
            if(!subCategoriesArray || subCategoriesArray.length === 0)
            { for (let subCategory in subCategories) {
                let itemsMap = subCategories[subCategory];
                traverseItems(itemsMap, filters, category, subCategory);
            }}
            else{
                for (let subCategory in subCategories) {
                    if (subCategoriesArray.includes(subCategory)) {
                        let itemsMap = subCategories[subCategory];
                        traverseItems(itemsMap, filters, category, subCategory);
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
    const { userId} = req.params;
    const { subCategories, colors, seasons, tags, fabric } = req.body;
    try {

        const filters = buildFilters({ colors, seasons, tags, fabric });
       
        const closet = await Closet.findOne({ userId });

     
        let items = closet.categories;
     
        const filteredItems = filterItems(items, filters, subCategories);
        const cleanedItems = filteredItems.map(item => item._doc);

        res.status(200).json(cleanedItems);
       
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
                matchedItems.push(...item.colors); 
            });
        }
    }

    function traverseCategories(categories) {
        for (let category in categories) {
            if (category === '_id') continue; 
            let subCategories = categories[category];
            if (typeof subCategories !== 'object' || subCategories === null) continue;

   
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
    const { userId} = req.params;
    const { category, subCategory } = req.body;
    try {
      
        const closet = await Closet.findOne({ userId });
        let allColors = [];

      
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
   

        // Flatten the nested array and remove duplicates
        const uniqueColors = Array.from(new Set(allColors.flat()));

        res.status(200).json(uniqueColors);
    } catch (error) {
        console.error("error ", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

const transformFilteredItems = (filteredItems) => {
    const transformedData = {};

    filteredItems.forEach(item => {
        const { category, subCategory } = item;
        const { _id, colors } = item._doc;

        if (!transformedData[category]) {
            transformedData[category] = {};
        }

        if (!transformedData[category][subCategory]) {
            transformedData[category][subCategory] = [];
        }

        transformedData[category][subCategory].push({
            [_id]: colors
        });
    });

    return transformedData;
};


export const filterAndTransformCloset = async (req, res) => {
    const { userId } = req.params;
    const { seasons, tags } = req.body;
    try {
        const filters = buildFilters({ seasons, tags });
        const closet = await Closet.findOne({ userId });

        if (!closet) {
            return res.status(404).json({ message: 'Closet not found' });
        }

        const items = closet.categories;
        const filteredItems = filterItems(items, filters, null); // Pass null to check all subcategories
        // console.log(filteredItems);
        const transformedData = transformFilteredItems(filteredItems);

        res.status(200).json(transformedData);
    } catch (error) {
        console.error("error", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};