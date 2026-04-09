// models/Banner.js
import mongoose from "mongoose";
const bannerSchema = new mongoose.Schema({
    mainHead: {
        type: String,
    },
    subHead: {
        type: String,
    },
    status: {
        type: String,
        default: "Active",
        enum: ["Active", "Inactive"]
    },
    file: {
        type: String,
        required: true
    },
    //    file: {
    //       url: String,
    //       public_id: String
    //     }
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    }

}, { timestamps: true });

const Banners = mongoose.model('Banners', bannerSchema);
export default Banners;
