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


export const getAllSpecificSeasonOutfits = async (req, res) => {
    try {
        const { userId, season } = req.params;

        const closet = await Closet.findOne({ userId });

        if (!closet) {
            return res.status(404).json({ message: "Closet not found" });
        }

        const outfits = closet.outfits[season];
        console.log(outfits);

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

        // const allOutfits = {};
        // for (const season in outfits) {
        //     allOutfits[season] = Object.values(outfits[season]); // Convert nested object to array
        // }

       // console.log("all outfit== " ,allOutfits )

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
     