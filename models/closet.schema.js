import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    imgUrl: String,
    seasons: [Number],
    colors: [String],
    fabric: String
});

const sizeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    width: Number,
    height: Number,
});

const positionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    x: Number,
    y: Number,
});

const outfitItemsSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    itemsId: [mongoose.Schema.Types.ObjectId],
    colorPalette: [String],
    sizes: [sizeSchema],
    positions: [positionSchema],
    imgUrl: String
});

const categoriesSchema = new mongoose.Schema({
    Tops: {
        T_Shirts: [itemSchema]
    },
    Bottoms: {
        Jeans: [itemSchema]
    }
});

const outfitsSchema = new mongoose.Schema({
    Summer: [outfitItemsSchema],
    Winter: [outfitItemsSchema]
});

const closetSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    categories: categoriesSchema,
    userId: String,
    outfits: outfitsSchema
});

const Closet = mongoose.model("userclothes", closetSchema);

export default Closet;
