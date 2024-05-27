import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    id: String,
    imgUrl: String,
    seasons: [Number],
    colors: [String],
    fabric: String
});

const categoriesSchema = new mongoose.Schema({
    Tops: {
        shirt: [itemSchema]
    },
    bottoms: {
        Jeans: [itemSchema]
    }
});

const closetSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    categories: categoriesSchema,
    userId: String
});

const Closet = mongoose.model("userClothes", closetSchema);

export default Closet;
