import mongoose from "mongoose";

const favhomeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  home: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Home",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const FavHome = mongoose.model("FavHome", favhomeSchema);
