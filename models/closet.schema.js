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
        }
    },
    Bottoms: {
        Jeans: {
            type: Map,
            of: itemSchema
        }
    }
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
