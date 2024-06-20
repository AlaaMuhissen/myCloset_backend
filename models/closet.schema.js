import mongoose from "mongoose";

// Item schema
const itemSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    imgUrl: String,
    seasons: [Number],
    colors: [String],
    fabric: String
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
    imgUrl: String
});

// Categories schema
const categoriesSchema = new mongoose.Schema({
    Tops: {
        T_Shirts: {
            type: Map,
            of: itemSchema
        },
        Hoodies: {
            type: Map,
            of: itemSchema
        },
        Blouses: {
            type: Map,
            of: itemSchema
        },
       
        Shirts: {
            type: Map,
            of: itemSchema
        },
        Sweaters: {
            type: Map,
            of: itemSchema
        },
        Basics: {
            type: Map,
            of: itemSchema
        }
    },
    Bottoms: {
        Jeans: {
            type: Map,
            of: itemSchema
        },
        Skirts: {
            type: Map,
            of: itemSchema
        },
        Shorts: {
            type: Map,
            of: itemSchema
        }
    },
    Outwear: {
        Jackets: {
            type: Map,
            of: itemSchema
        },
        Coats: {
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
        Sandals_and_Flip_Flops: {
            type: Map,
            of: itemSchema
        },
        Dress_Shoes: {
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
        Hats: {
            type: Map,
            of: itemSchema
        },
        Hejab: {
            type: Map,
            of: itemSchema
        }
    },
    Jewelry: {
        Necklaces: {
            type: Map,
            of: itemSchema
        },
        Earrings: {
            type: Map,
            of: itemSchema
        },
        Rings: {
            type: Map,
            of: itemSchema
        },
        Watches: {
            type: Map,
            of: itemSchema
        }
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

// Main closet schema
const closetSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    categories: categoriesSchema,
    userId: { type: String },
    outfits: outfitsSchema
});

const Closet = mongoose.model("userclothes", closetSchema);

export default Closet;
