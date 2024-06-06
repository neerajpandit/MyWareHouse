import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    home: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "Home", required: true },
    comment: {
        type: String, 
        required: true },
    rating: { 
        type: Number, 
        required: true, 
        default:0,
        min: 1, max: 5 },
  },
  {
    timestamps: true,
  },
);
export const Review = mongoose.model("Review", reviewSchema);
