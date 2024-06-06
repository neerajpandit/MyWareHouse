import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Home } from "../models/Home.model.js";
import {Review} from "../models/Review.model.js";


const createRating = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { homeId, rating,comment } = req.body;

  const review = new Review({
    reviewer: userId,
    home: homeId,
    rating: rating,
    comment: comment,
  });

  if (!review) {
    throw new ApiError(400, "Revie is not Created");
  }
  await review.save();
  const home = await Home.findById(homeId);
  //console.log(product)
  home.reviews.push(review);
  await home.save();
  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review Create Successful"));
});

const getRating = asyncHandler(async (req, res) => {
  const review = await Review.find();
  if (!review) {
    throw new ApiError(400, "Rating not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, review, "Rating fetch successfully"));
});

export { createRating, getRating };
