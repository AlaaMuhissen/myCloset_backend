import mongoose from "mongoose";

// Item schema
const itemSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    imgUrl: String,
    seasons: [Number],
    colors: [String],
    fabric: String,
    tags: [String]
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

// Main closet schema
const closetSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    categories: categoriesSchema,
    userId: { type: String },
    outfits: outfitsSchema,
    clothesNumber : {
        type: Number,
        default : 0
    },
    outfitNumber : {
        type: Number,
        default : 0
    }
});

const Closet = mongoose.model("userclothes", closetSchema);

export default Closet;
