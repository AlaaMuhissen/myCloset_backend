import mongoose from "mongoose";

const usageLogSchema = new mongoose.Schema({
    date: { type: Date, required: true },
}, { _id: false }); 

// Item schema
const itemSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    imgUrl: String,
    seasons: [Number],
    colors: [String],
    fabric: String,
    tags: [String],
    usageLog: [usageLogSchema] 
});

// Size schema
const sizeSchema = new mongoose.Schema({
    width: Number,
    height: Number,
}, { _id: false });

// Position schema
const positionSchema = new mongoose.Schema({
    x: Number,
    y: Number,
}, { _id: false });

const itemsSourceSchema = new mongoose.Schema({
    category: String,
    subCategory: String,
}, { _id: false });

// Outfit items schema
const outfitItemsSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    itemsId: [mongoose.Schema.Types.ObjectId],
    colorPalette: [String],
    sizes: {
        type: Map,
        of: sizeSchema
    },
    positions: {
        type: Map,
        of: positionSchema
    },
    itemsSource: {
        type: Map,
        of: itemsSourceSchema
    },
    imgUrl: String,
    isAIOutfit : Boolean,
    inFavorite:  { type: Boolean, default: false },
});

// Categories schema
const categoriesSchema = new mongoose.Schema({
    Tops: {
        T_shirt: {
            type: Map,
            of: itemSchema
        },
        Pullover: {
            type: Map,
            of: itemSchema
        },
        Hoodie: {
            type: Map,
            of: itemSchema
        },
        Blouse: {
            type: Map,
            of: itemSchema
        },
       
        Shirt: {
            type: Map,
            of: itemSchema
        },
        Sweater: {
            type: Map,
            of: itemSchema
        },
        Basic: {
            type: Map,
            of: itemSchema
        }
    },
    One_Piece: {
        Dresses: {
            type: Map,
            of: itemSchema
        },
        Overalls: {
            type: Map,
            of: itemSchema
        }
    },
    Bottoms: {
        Jeans: {
            type: Map,
            of: itemSchema
        },
        Pants: {
            type: Map,
            of: itemSchema
        },
        Skirt: {
            type: Map,
            of: itemSchema
        },
        Short: {
            type: Map,
            of: itemSchema
        }
    },
    Outwear: {
        Jacket: {
            type: Map,
            of: itemSchema
        },
        Coat: {
            type: Map,
            of: itemSchema
        },
        Vests: {
            type: Map,
            of: itemSchema
        }
    },
    Shoes: {
        Casual_Shoes: {
            type: Map,
            of: itemSchema
        },
        Formal_Shoes: {
            type: Map,
            of: itemSchema
        },
        Boots: {
            type: Map,
            of: itemSchema
        },
        Sandal: {
            type: Map,
            of: itemSchema
        },
        Flip_Flops: {
            type: Map,
            of: itemSchema
        },
        Heels: {
            type: Map,
            of: itemSchema
        },
        Athletic_Shoes: {
            type: Map,
            of: itemSchema
        }
    },
    Bags: {
        Shoulder_Bag: {
            type: Map,
            of: itemSchema
        },
        Crossbody_Bag: {
            type: Map,
            of: itemSchema
        },
        Backpack: {
            type: Map,
            of: itemSchema
        },
        Wallet: {
            type: Map,
            of: itemSchema
        },
        Beach_Bag: {
            type: Map,
            of: itemSchema
        },
        Laptop_Bag: {
            type: Map,
            of: itemSchema
        }
    },
    Head_wear: {
        Hat: {
            type: Map,
            of: itemSchema
        },
        Scarf: {
            type: Map,
            of: itemSchema
        }
    },
    Jewelry: {
        Necklace: {
            type: Map,
            of: itemSchema
        },
        Earring: {
            type: Map,
            of: itemSchema
        },
        Ring: {
            type: Map,
            of: itemSchema
        },
        Watches: {
            type: Map,
            of: itemSchema
        },
        Bracelet: {
            type: Map,
            of: itemSchema
        },
        Glasses: {
            type: Map,
            of: itemSchema
        },
    },
    Other_items: {
        others: {
            type: Map,
            of: itemSchema
        } 
    },
});

// Outfits schema
const outfitsSchema = new mongoose.Schema({
    Summer: {
        type: Map,
        of: outfitItemsSchema
    },
    Winter: {
        type: Map,
        of: outfitItemsSchema
    }
});

const historySchema = new mongoose.Schema({
    date: { type: Date, required: true, index: true },
    outfits: [{
        outfitId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
        outfitImg: { type: String, required: true },
        isAIOutfit: { type: Boolean, required: true, default: false }
    }]
});
const favoriteOutfitsSchema = new mongoose.Schema({
    season: { type: String, required: true },
    outfitIds: [{ type: mongoose.Schema.Types.ObjectId, required: true }]
});


// Main closet schema
const closetSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: { type: String },
    categories: categoriesSchema,
    outfits: outfitsSchema,
    clothesNumber : {
        type: Number,
        default : 0
    },
    outfitNumber : {
        type: Number,
        default : 0
    },
    history: [historySchema],
    favoriteOutfits : [favoriteOutfitsSchema]
});

const Closet = mongoose.model("userclothes", closetSchema);

export default Closet;
