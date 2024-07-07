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
            return res.status(404).json({ message: "Outfits not found FOR this Season" });
        }

        const outfit = outfits.get(outfitNumber);

        if (!outfit) {
            return res.status(404).json({ message: "Outfit not found" });
        }

        res.status(200).json(outfit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const addLogOutfitUsage = async (req, res) => {
    const { userId } = req.params;
    const { outfitId, isAIOutfit } = req.body;

    try {
        const userCloset = await Closet.findOne({ userId });
        if (!userCloset) {
            return res.status(404).send('User closet not found');
        }

        // Define seasons
        const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];

        // Find the outfit
        let outfit = null;
        for (const season of seasons) {
            if (userCloset.outfits[season] && userCloset.outfits[season].has(outfitId)) {
                outfit = userCloset.outfits[season].get(outfitId);
                break;
            }
        }
        if (!outfit) {
            return res.status(404).send('Outfit not found');
        }

        const now = new Date();
        const today = new Date(now.toDateString()); // Normalize to date without time

        // Check if there is an entry for today's date
        let historyEntry = userCloset.history.find(log => {
            return new Date(log.date).toDateString() === today.toDateString();
        });

        if (historyEntry) {
            // Check if the same outfit is already logged for today
            const sameOutfitLogged = historyEntry.outfits.some(outfitLog => outfitLog.outfitId.toString() === outfitId);
            if (sameOutfitLogged) {
                return res.status(400).send('This outfit usage already logged for today');
            }
            // Add the new outfit to the existing entry for today
            historyEntry.outfits.push({ outfitId, isAIOutfit });
        } else {
            // Create a new entry for today
            userCloset.history.push({ date: today, outfits: [{ outfitId, isAIOutfit }] });
        }

        // Log usage for each item in the outfit
        const itemsId = outfit.itemsId;
        console.log('itemsId => ', itemsId);
        const newUsageLog = { date: now };

        const categories = userCloset.categories;
        for (let category in categories) {
            if (category === '_id') continue; // Skip the _id field

            let subCategories = categories[category];
            if (typeof subCategories !== 'object' || subCategories === null) continue;

            for (let subCategory in subCategories) {
                let itemsMap = subCategories[subCategory];
                if (itemsMap instanceof Map) {
                    for (let [itemId, item] of itemsMap.entries()) {
                        if (itemsId.includes(itemId)) {
                            item.usageLog.push(newUsageLog);
                            console.log("item => ", item);
                        }
                    }
                }
            }
        }
  
        await userCloset.save();
        res.status(200).send('Outfit usage logged');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging outfit usage');
    }
};

export const getOutfitNumberMadeByAI = async (req, res) => {
    try {
        const { userId } = req.params;
        const { weeks } = req.query; // Assuming the period is provided as a query parameter
  
        const weeksPeriod = parseInt(weeks, 10);

        if (isNaN(weeksPeriod) || weeksPeriod <= 0) {
            return res.status(400).json({ message: "Invalid period. Please provide a valid number of weeks." });
        }

        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "User closet not found" });

        const history = closet.history;

        const now = new Date();
        const periodStartDate = new Date(now);
        periodStartDate.setDate(now.getDate() - (weeksPeriod * 7));

        // Filter the history to count the number of AI-made outfits within the period
        const aiOutfitCount = history.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= periodStartDate && entryDate <= now && entry.outfits.some(outfit => outfit.isAIOutfit);
        }).reduce((count, entry) => count + entry.outfits.filter(outfit => outfit.isAIOutfit).length, 0);

        res.status(200).json({ aiOutfitCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
export const getOutfitsNumber = async (req, res) => {
    try {
        const { userId } = req.params;
        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({outfitNumber : closet.outfitNumber});
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export const editHistory = async (req, res) => {
    try {
        const { userId ,outfitId } = req.params;
        const {  date } = req.body;

        if (!mongoose.Types.ObjectId.isValid(outfitId)) {
            return res.status(400).json({ message: "Invalid outfit ID" });
        }

        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: "Invalid date" });
        }
        const normalizedDate = parsedDate.toDateString();
        console.log(normalizedDate)
        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "User closet not found" });

        // Find and remove the history entry
        const historyEntryIndex = closet.history.findIndex(entry => {
            const entryDate = new Date(entry.date).toDateString();
            return entryDate === normalizedDate && entry.outfits.some(outfit => outfit.outfitId.toString() === outfitId);
        });

        if (historyEntryIndex === -1) {
            return res.status(404).json({ message: "Outfit not found in history for the specified date" });
        }

        const historyEntry = closet.history[historyEntryIndex];
        historyEntry.outfits = historyEntry.outfits.filter(outfit => outfit.outfitId.toString() !== outfitId);

        if (historyEntry.outfits.length === 0) {
            closet.history.splice(historyEntryIndex, 1); // Remove the history entry if no outfits left
        }

        // Remove the usage log for each item in the outfit
        let outfitItems = null;
        const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
        for (const season of seasons) {
            if (closet.outfits[season] && closet.outfits[season].has(outfitId)) {
                outfitItems = closet.outfits[season].get(outfitId).itemsId;
                break;
            }
        }

        if (outfitItems) {
            const categories = closet.categories;
            for (let category in categories) {
                if (category === '_id') continue; // Skip the _id field

                let subCategories = categories[category];
                if (typeof subCategories !== 'object' || subCategories === null) continue;

                for (let subCategory in subCategories) {
                    let itemsMap = subCategories[subCategory];
                    if (itemsMap instanceof Map) {
                        for (let [itemId, item] of itemsMap.entries()) {
                            if (outfitItems.includes(itemId)) {
                                item.usageLog = item.usageLog.filter(log => new Date(log.date).toDateString() !== normalizedDate);
                            }
                        }
                    }
                }
            }
        }

        await closet.save();
        res.status(200).json({ message: "Outfit removed from history and usage logs updated" });
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
            return res.status(404).json({ message: "There are no outfits for this season" });
        }

        // Function to handle Map conversion during JSON.stringify
        const replacer = (key, value) => {
            if (value instanceof Map) {
                return Object.fromEntries(value);
            }
            return value;
        };

        const jsonString = JSON.stringify(outfits, replacer);
        const convertedOutfits = JSON.parse(jsonString);

        res.status(200).json(convertedOutfits);
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

        res.status(200).json(outfits);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const editOutfit = async (req, res) => {
    try {
        const { userId, season, outfitNumber } = req.params;
        const { itemsId, colorPalette, sizes, positions, imgUrl, itemsSource } = req.body;

        // Construct the update object
        let updateObject = {};

        if (itemsId) {
            updateObject[`outfits.${season}.${outfitNumber}.itemsId`] = itemsId.map(id => new mongoose.Types.ObjectId(id));
        }
        if (colorPalette) {
            updateObject[`outfits.${season}.${outfitNumber}.colorPalette`] = colorPalette;
        }
        if (imgUrl) {
            updateObject[`outfits.${season}.${outfitNumber}.imgUrl`] = imgUrl;
        }
        if (sizes) {
            updateObject[`outfits.${season}.${outfitNumber}.sizes`] = Object.keys(sizes).reduce((acc, key) => {
                acc[key] = {
                    width: parseFloat(sizes[key].width),
                    height: parseFloat(sizes[key].height)
                };
                return acc;
            }, {});
        }
        if (positions) {
            updateObject[`outfits.${season}.${outfitNumber}.positions`] = Object.keys(positions).reduce((acc, key) => {
                acc[key] = {
                    x: parseFloat(positions[key].x),
                    y: parseFloat(positions[key].y)
                };
                return acc;
            }, {});
        }
        if (itemsSource) {
            updateObject[`outfits.${season}.${outfitNumber}.itemsSource`] = Object.keys(itemsSource).reduce((acc, key) => {
                acc[key] = {
                    category: itemsSource[key].category,
                    subCategory: itemsSource[key].subCategory
                };
                return acc;
            }, {});
        }

        // Update the outfit in the user's closet
        const updatedCloset = await Closet.findOneAndUpdate(
            { userId },
            { $set: updateObject },
            { new: true }
        );

        if (!updatedCloset) {
            return res.status(404).json({ message: 'Closet not found' });
        }

        const updatedOutfit = updatedCloset.outfits[season].get(outfitNumber);

        res.status(200).json(updatedOutfit);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const addOutfit = async (req, res) => {
    try {
        const { userId, season} = req.params;
        const {itemsId, colorPalette, sizes, positions, imgUrl,itemsSource } = req.body;

          // Create a new outfit
          const newOutfit = {
            _id: new mongoose.Types.ObjectId(),
            itemsId,
            colorPalette,
            sizes,
            positions,
            itemsSource,
            imgUrl
        };
        const outfitId = newOutfit._id;
        // Update the user's closet with the new outfit
        const updatedCloset = await Closet.findOneAndUpdate(
            { userId },
            { 
                $set: {
                    [`outfits.${season}.${outfitId}`]: newOutfit
                },
                $inc: { outfitNumber: 1 }
            },
            { new: true, upsert: true } // `upsert: true` will create the document if it doesn't exist
        );

        if (!updatedCloset) {
            return res.status(404).json({ message: 'Closet not found' });
        }

        res.status(201).json({ message: 'Outfit added successfully', closet: updatedCloset });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteOutfit = async (req, res) => {
    try {
        const { userId, season } = req.params;
        const { itemsId } = req.body; //outfit ids

        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "Item not found" });

        const outfits = closet.outfits[season];

        if (!outfits) {
            return res.status(404).json({ message: "There are no outfits" });
        }
        
        // Iterate over itemsId and delete the corresponding entries from the outfits map
        itemsId.forEach(id => {
            if (outfits.has(id)) {
                outfits.delete(id);
            }
        });
      
        const deletedCount = itemsId.length
        const updatedCloset = await Closet.findOneAndUpdate(
            { userId },
            {
                $set: { [`outfits.${season}`]: outfits },
                $inc: { outfitNumber: -deletedCount }
            },
            { new: true }
        );
    
        if (!updatedCloset) {
            return res.status(404).json({ message: "Closet not found" });
        }

        res.status(200).json({ message: 'Outfits deleted successfully', closet: updatedCloset });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const getOutfitIdsContainingItems = async (req, res) => {
    try {
        const { userId } = req.params;
        const { itemsId } = req.body;//clothe items ids
    
        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "Closet not found" });

        const seasons = ['Spring', 'Summer', 'Autumn', 'Winter'];
        const result = [];
        const outfitsContainingItemsImgs = [];

        seasons.forEach(season => {
            const outfits = closet.outfits[season];
          
            if (outfits) {
                const outfitsContainingItems = [];
                for (const [outfitId, outfit] of outfits) {
                    const outfitItems = outfit.itemsId.map(itemId => itemId.toString());
             
                    const itemsIdStrings = itemsId.map(itemId => itemId.toString());
              
                    if (itemsIdStrings.some(itemId => outfitItems.includes(itemId))) {
                        outfitsContainingItems.push(outfitId);
                        outfitsContainingItemsImgs.push(outfit.imgUrl);
                    }
                }
                if (outfitsContainingItems.length > 0) {
                    result.push({
                        season,
                        outfitsId: outfitsContainingItems
                    },
                );
                }
            }
        });

        res.status(200).json({outfitData: result ,    outfitImg : outfitsContainingItemsImgs  } );
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



export const deleteFromFavorite = async (req, res) => {
    const { userId } = req.params;
    const { season, outfitId } = req.body;


    if (!season || !outfitId) {
        return res.status(400).json({ message: "Season and outfit ID are required" });
    }

    try {
        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "User closet not found" });

        // Find the favorite outfits for the given season
        let favoriteOutfit = closet.favoriteOutfits.find(fav => fav.season === season);

        if (favoriteOutfit) {
            // If the season exists, remove the outfit ID from the outfitIds array
            favoriteOutfit.outfitIds = favoriteOutfit.outfitIds.filter(id => id.toString() !== outfitId);

            if (favoriteOutfit.outfitIds.length === 0) {
                // If no outfit IDs left, remove the entire favorite outfit entry for the season
                closet.favoriteOutfits = closet.favoriteOutfits.filter(fav => fav.season !== season);
            }

            // Update the inFavorite field for the outfit
            const seasons = ['Spring', 'Summer','Autumn', 'Winter'];
            for (const season of seasons) {
                if (closet.outfits[season] && closet.outfits[season].has(outfitId)) {
                    closet.outfits[season].get(outfitId).inFavorite = false;
                    break;
                }
            }

            await closet.save();
            res.status(200).json({ message: "Outfit removed from favorites", favoriteOutfits: closet.favoriteOutfits });
        } else {
            return res.status(404).json({ message: "Favorite outfit for the given season not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const addToFavorite = async (req, res) => {
    const { userId } = req.params;
    const { season, outfitId } = req.body;

    if (!season || !outfitId) {
        return res.status(400).json({ message: "Season and outfit ID are required" });
    }

    try {
        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "User closet not found" });

        // Find the favorite outfits for the given season
        let favoriteOutfit = closet.favoriteOutfits.find(fav => fav.season === season);

        if (favoriteOutfit) {
            // If the season exists, add the outfit ID to the outfitIds array if not already present
            if (!favoriteOutfit.outfitIds.includes(outfitId)) {
                favoriteOutfit.outfitIds.push(outfitId);
            } else {
                return res.status(400).json({ message: "Outfit is already in favorites" });
            }
        } else {
            // If the season does not exist, create a new entry
            closet.favoriteOutfits.push({
                season,
                outfitIds: [outfitId]
            });
        }
            // Update the inFavorite field for the outfit
            const seasons = ['Spring', 'Summer','Autumn', 'Winter'];
            for (const season of seasons) {
                if (closet.outfits[season] && closet.outfits[season].has(outfitId)) {
                    closet.outfits[season].get(outfitId).inFavorite = true;
                    break;
                }
            }
        await closet.save();
        res.status(200).json({ message: "Outfit added to favorites", favoriteOutfits: closet.favoriteOutfits });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}


export const getFavoriteOutfit = async (req, res) => {

    const { userId, season } = req.params;

    if (!season) {
        return res.status(400).json({ message: "Season is required" });
    }

    try {
        const closet = await Closet.findOne({ userId });
        if (!closet) return res.status(404).json({ message: "User closet not found" });

        // Find the favorite outfits for the given season
        const favoriteOutfit = closet.favoriteOutfits.find(fav => fav.season === season);

        if (favoriteOutfit) {
            const favoriteOutfitsWithDetails = [];
            const outfitIds = favoriteOutfit.outfitIds;

            const seasons = ['Spring', 'Summer','Autumn', 'Winter'];
            for (const season of seasons) {
                if (closet.outfits[season]) {
                    for (const [outfitId, outfitDetails] of closet.outfits[season]) {
                        if (outfitIds.includes(outfitId.toString())) {
                            favoriteOutfitsWithDetails.push({
                                outfitId: outfitId.toString(),
                                imgUrl: outfitDetails.imgUrl,
                                season
                            });
                        }
                    }
                }
            }

            res.status(200).json({ favoriteOutfits: favoriteOutfitsWithDetails });
        } else {
            res.status(404).json({ message: "No favorite outfits found for the given season" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}