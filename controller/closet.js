import Closet from "../models/closet.schema.js";
import mongoose from "mongoose";
export const getUserClothes = async (req, res) => {
    try {
        const { userId } = req.params;
       
        const closet = await Closet.findOne({ userId });
        // if (!closet) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(closet);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


export const getClothesNumber = async (req, res) => {
    try {
        const { userId } = req.params;
       
        const closet = await Closet.findOne({ userId });
        // if (!closet) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({clothesNumber : closet.clothesNumber});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
export const getUserCategoryItems = async (req, res) => {
    try {
        const { userId , category} = req.params;
       
        const closet = await Closet.findOne({ userId });
        // if (!closet) return res.status(404).json({ message: "Item not found" });
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
            // return res.status(404).json({ message: "Closet not found" });
        }
        
        const items = closet.categories?.[category]?.[subCategory];
        
        if (!items) {
            // return res.status(404).json({ message: "Category or subcategory not found" });
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
            // return res.status(404).json({ message: "Closet not found" });
        }
        
        const item = closet.categories?.[category]?.[subCategory].get(itemId);
        
        if (!item) {
            // return res.status(404).json({ message: "Category or subcategory not found" });
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
        // if (!closet) return res.status(404).json({ message: "Item not found" });

        const items = closet.categories?.[category]?.[subCategory];
        if (!items) {
            // return res.status(404).json({ message: "There are no outfits" });
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
            // return res.status(404).json({ message: "Closet not found" });
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
            // return res.status(404).json({ message: "Closet not found" });
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
            // return res.status(404).json({ message: 'Closet not found' });
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
            // return res.status(404).json({ message: 'Closet not found' });
        }

        const updatedOutfit = updatedItem.categories[category][subCategory].get(itemId);
      
        if (!updatedOutfit) {
            // return res.status(404).json({ message: 'Item not found' });
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
            // return res.status(404).json({ message: 'Closet not found' });
        }

        const items = closet.categories;
        const filteredItems = filterItems(items, filters, null); // Pass null to check all subcategories
       
        const transformedData = transformFilteredItems(filteredItems);

        res.status(200).json(transformedData);
    } catch (error) {
        console.error("error", error);
        res.status(500).json({ message: 'Server Error', error });
    }
};

// Helper functions to get outfit and item details
const getOutfitDetails = (userCloset, outfitId) => {
    const stringId = outfitId.toString();
    for (const season in userCloset.outfits) {
        const itemMap = userCloset.outfits[season];
        if(itemMap  instanceof Map){
            if(userCloset.outfits[season].has(stringId)){
                return userCloset.outfits[season].get(stringId);
            }
        }
        
    }
    return null;
};

const getItemDetails = (userCloset, itemId) => {
    const stringId = itemId.toString();
    for (const category in userCloset.categories) {
        if (category === '_id') continue;
        const subCategories = userCloset.categories[category];
        for (const subCategory in subCategories) {
            const itemsMap = subCategories[subCategory];
            if(itemsMap  instanceof Map){
                if (itemsMap.has(stringId)) {
                    return itemsMap.get(stringId);
                }
            }
        }
    }
    return null;
};

export const getUserStatistics = async (req, res) => {
    const { userId, period } = req.params;

    try {
        const userCloset = await Closet.findOne({ userId });
        if (!userCloset) {
            // return res.status(404).send('User closet not found');
        }

        // Calculate the date range for the given period (in weeks)
        const now = new Date();
        const periodStartDate = new Date(now);
        periodStartDate.setDate(periodStartDate.getDate() - period * 7);

        const statistics = {
            totalItems: {'Tops' : 0 ,
                'Bottoms' : 0,
                'One_Piece': 0 ,
                'Outwear' : 0,
                'Shoes' : 0,
                'Bags': 0,
                'Head_wear' : 0,
                'Jewelry' : 0,
                'Other_items':0


            },
            mostWornItems: {},
            leastWornItems: {},
            seasonalWear: { Summer: 0, Winter: 0, Spring: 0, Autumn: 0 },
            colorDistribution: {},
            fabricDistribution: {},
            tagUsage: {},
            newAdditions: 0,
            unusedItems: {}
        };

        const wearFrequencyData = {};

        // Calculate total items and initialize wear frequency data
        for (const category in userCloset.categories) {
            if (category === '_id') continue;
            const subCategories = userCloset.categories[category];
            for (const subCategory in subCategories) {
                const itemsMap = subCategories[subCategory];
                if (itemsMap instanceof Map) {
                    statistics.totalItems[`${category}`] += itemsMap.size;

                    // Initialize wear frequency data
                    wearFrequencyData[category] = wearFrequencyData[category] || {};
                    wearFrequencyData[category][subCategory] = {};

                    for (let [itemId, item] of itemsMap.entries()) {
                        wearFrequencyData[category][subCategory][itemId] = {
                            count: 0,
                            item: item
                        };
                    }
                }
            }
        }

        // Update wear frequency from history
        userCloset.history.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= periodStartDate && entryDate <= now) {
                entry.outfits.forEach(outfit => {
                    const outfitDetails = getOutfitDetails(userCloset, outfit.outfitId);
                    if (outfitDetails) {
                        outfitDetails.itemsId.forEach(itemId => {
                            for (const category in wearFrequencyData) {
                                const subCategories = wearFrequencyData[category];
                                for (const subCategory in subCategories) {
                                    if (wearFrequencyData[category][subCategory][itemId]) {
                                        wearFrequencyData[category][subCategory][itemId].count++;
                                    }
                                }
                            }
                        });
                    }
                });
            }
        });

        // Determine the most worn, least worn, and unused items
        for (const category in wearFrequencyData) {
            for (const subCategory in wearFrequencyData[category]) {
                let mostWornItemId = null;
                let leastWornItemId = null;
                let highestCount = 0;
                let lowestCount = Infinity;

                for (const itemId in wearFrequencyData[category][subCategory]) {
                    const itemData = wearFrequencyData[category][subCategory][itemId];
                    if (itemData.count > highestCount) {
                        highestCount = itemData.count;
                        mostWornItemId = itemId;
                    }
                    if (itemData.count < lowestCount && itemData.count > 0) {
                        lowestCount = itemData.count;
                        leastWornItemId = itemId;
                    }
                }

                if (mostWornItemId) {
                    statistics.mostWornItems[`${category}_${subCategory}`] = {
                        itemId: mostWornItemId,
                        item: wearFrequencyData[category][subCategory][mostWornItemId].item,
                        count: highestCount
                    };
                }

                if (leastWornItemId && leastWornItemId !== mostWornItemId) {
                    statistics.leastWornItems[`${category}_${subCategory}`] = {
                        itemId: leastWornItemId,
                        item: wearFrequencyData[category][subCategory][leastWornItemId].item,
                        count: lowestCount
                    };
                }

                // Collect unused items
                for (const itemId in wearFrequencyData[category][subCategory]) {
                    const itemData = wearFrequencyData[category][subCategory][itemId];
                    if (itemData.count === 0 && itemId !== mostWornItemId && itemId !== leastWornItemId) {
                        statistics.unusedItems[`${category}_${subCategory}`] = statistics.unusedItems[`${category}_${subCategory}`] || [];
                        statistics.unusedItems[`${category}_${subCategory}`].push({
                            itemId: itemId,
                            item: itemData.item
                        });
                    }
                }
            }
        }

        // Calculate other statistics
        userCloset.history.forEach(entry => {
            const entryDate = new Date(entry.date);
            if (entryDate >= periodStartDate && entryDate <= now) {
                entry.outfits.forEach(outfit => {
                    if (outfit.season) {
                        statistics.seasonalWear[outfit.season]++;
                    }
                    statistics.newAdditions++;

                    const outfitDetails = getOutfitDetails(userCloset, outfit.outfitId);
                    if (outfitDetails) {
                        outfitDetails.itemsId.forEach(itemId => {
                            const item = getItemDetails(userCloset, itemId);
                            if (item) {
                                item.colors.forEach(color => {
                                    statistics.colorDistribution[color] = (statistics.colorDistribution[color] || 0) + 1;
                                });
                                statistics.fabricDistribution[item.fabric] = (statistics.fabricDistribution[item.fabric] || 0) + 1;
                                item.tags.forEach(tag => {
                                    statistics.tagUsage[tag] = (statistics.tagUsage[tag] || 0) + 1;
                                });
                            }
                        });
                    }
                });
            }
        });

        res.status(200).json(statistics);
    } catch (error) {
        res.status(500).send('Error retrieving user statistics');
    }
};







//=========================

export const addNewUser = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        // Check if the user already has a closet
        const existingCloset = await Closet.findOne({ userId });
        if (existingCloset) {
            return res.status(400).json({ message: "User closet already exists" });
        }

        // Create a new user closet
        const newUserCloset = new Closet({
            _id: new mongoose.Types.ObjectId(),
            userId,
            categories: {
                Tops: {
                    T_shirt: new Map(),
                    Pullover: new Map(),
                    Hoodie: new Map(),
                    Blouse: new Map(),
                    Shirt: new Map(),
                    Sweater: new Map(),
                    Basic: new Map()
                },
                One_Piece: {
                    Dresses: new Map(),
                    Overalls: new Map()
                },
                Bottoms: {
                    Jeans: new Map(),
                    Pants: new Map(),
                    Skirt: new Map(),
                    Short: new Map()
                },
                Outwear: {
                    Jacket: new Map(),
                    Coat: new Map(),
                    Vests: new Map()
                },
                Shoes: {
                    Casual_Shoes: new Map(),
                    Formal_Shoes: new Map(),
                    Boots: new Map(),
                    Sandal: new Map(),
                    Flip_Flops: new Map(),
                    Heels: new Map(),
                    Athletic_Shoes: new Map()
                },
                Bags: {
                    Shoulder_Bag: new Map(),
                    Crossbody_Bag: new Map(),
                    Backpack: new Map(),
                    Wallet: new Map(),
                    Beach_Bag: new Map(),
                    Laptop_Bag: new Map()
                },
                Head_wear: {
                    Hat: new Map(),
                    Scarf: new Map()
                },
                Jewelry: {
                    Necklace: new Map(),
                    Earring: new Map(),
                    Ring: new Map(),
                    Watches: new Map(),
                    Bracelet: new Map(),
                    Glasses: new Map()
                },
                Other_items: {
                    others: new Map()
                }
            },
            outfits: {
                Summer: new Map(),
                Winter: new Map(),
                Autumn: new Map(),
                Spring: new Map()
            },
            history: [],
            clothesNumber: 0,
            outfitNumber: 0
        });

        await newUserCloset.save();
        res.status(201).json({ message: "New user closet created", closet: newUserCloset });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
