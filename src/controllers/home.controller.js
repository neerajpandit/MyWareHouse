import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Home } from "../models/Home.model.js";
// import Review from "../models/Review.model.js";
import axios from "axios";

const GOOGLE_MAPS_API_KEY ='AIzaSyBcu1klbuf4MBdyIr8AIH5OYN7If-fGEng';
const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    address,
    city,
    state,
    zipCode,
    country,
    noOfRooms,
    // area,
    // images,
    // price,
    // owner,
    // facilities,
    // neighborhoodInfo,
    // publicReviews,
  } = req.body;

  const fullAddress = `${address}, ${city}, ${state}, ${zipCode}, ${country}`;

  // URL encode the address
  const encodedAddress = encodeURIComponent(fullAddress);

  // Get latitude and longitude from address

  const geoCodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(encodedAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
  const geoCodeResponse = await axios.get(geoCodeUrl);
  console.log('Geocoding API response:', geoCodeResponse.data);

  if (geoCodeResponse.data.status !== "OK") {
    return res.status(400).send("Invalid address");
  }

  const location = geoCodeResponse.data.results[0].geometry.location;

  const newHouse = new House({
    title,
    address,
    city,
    state,
    zipCode,
    country,
    latitude: location.lat,
    longitude: location.lng,
    noOfRooms,
    // area,
    // images,
    // price,
    // owner,
    // facilities,
    // neighborhoodInfo,
    // publicReviews,
  });

  const savedHouse = await newHouse.save();
  // const { title,numberOfRooms, reviews } = req.body;
  // const home = new Home({
  //   title,
  //   numberOfRooms,
  //   reviews,
  // });
  // if (!home) {
  //   throw new ApiError(400, "Product not created");
  // }
  // await home.save();
  return res
    .status(200)
    .json(new ApiResponse(200, "Product Add Successfully", savedHouse));
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await Home.find().populate("reviews");
  //   .populate("ratings")
  //   .populate("images");
  if (!product) {
    throw new ApiError(400, "product not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, product[0], "Product fetch successfully"));
});

export { createProduct, getProduct };
