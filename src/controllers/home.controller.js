import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Home } from "../models/Home.model.js";
import { User } from "../models/user.model.js";
// import Review from "../models/Review.model.js";
import axios from "axios";
import { FavHome } from "../models/FavHome.model.js";

// const GOOGLE_MAPS_API_KEY ='AIzaSyBcu1klbuf4MBdyIr8AIH5OYN7If-fGEng';
const createHouse = asyncHandler(async (req, res) => {
  const {
    title,
    address,
    city,
    state,
    zipCode,
    country,
    noOfRooms,
    area,
    // images,
    price,
    owner,
    facilities,
    neighborhoodInfo,
    // publicReviews,
  } = req.body;

  // const fullAddress = `${address}, ${city}, ${state}, ${zipCode}, ${country}`;

  // URL encode the address
  // const encodedAddress = encodeURIComponent(fullAddress);

  // Get latitude and longitude from address

  // const geoCodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(encodedAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
  // const geoCodeResponse = await axios.get(geoCodeUrl);
  // console.log('Geocoding API response:', geoCodeResponse.data);

  // if (geoCodeResponse.data.status !== "OK") {
  //   return res.status(400).send("Invalid address");
  // }

  // const location = geoCodeResponse.data.results[0].geometry.location;

  const newHouse = new Home({
    title,
    address,
    city,
    state,
    zipCode,
    country,
    // latitude: location.lat,
    // longitude: location.lng,
    noOfRooms,
    area,
    // images,
    price,
    owner,
    facilities,
    neighborhoodInfo,
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
    .json(new ApiResponse(200, "House Add Successfully", savedHouse));
});

const getHouse = asyncHandler(async (req, res) => {
  const house = await Home.find().populate("reviews");
  //   .populate("ratings")
  //   .populate("images");
  if (!house) {
    throw new ApiError(400, "House not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, house[1], "House fetch successfully"));
});

const getHouseById = asyncHandler(async (req, res) => {
  const house = await Home.findById(req.params.id).populate("reviews");
  if (!house) {
    throw new ApiError(400, "House not Found By ID");
  }
  return res.status(200).json(new ApiResponse(200, house, "House Found By Id"));
});

const updateHouse = asyncHandler(async (req, res) => {
  const {
    title,
    address,
    city,
    state,
    zipCode,
    country,
    noOfRooms,
    area,
    // images,
    price,
    owner,
    facilities,
    neighborhoodInfo,
    // publicReviews,
  } = req.body;

  const home = await Home.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: title,
        address: address,
        city: city,
        state: state,
        zipCode: zipCode,
        country: country,
        noOfRooms: noOfRooms,
        area: area,
        price: price,
        owner: owner,
        facilities: facilities,
        neighborhoodInfo: neighborhoodInfo,
      },
    },
    { new: true },
  );
  if (!home) {
    throw new ApiError(400, "Home Not found for Update");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, home, "Home updated Successfully"));
});

const deleteHouse = asyncHandler(async (req, res) => {
  const home = await Home.findByIdAndDelete(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, "House Deleted Successfully"));
});

const addfevHouse = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const home = await Home.findById(req.params.id);

  if (!user) {
    throw new ApiError(400, "User not found");
  }
  if (!home) {
    throw new ApiError(400, " House not found");
  }
  const fevHouse = new FavHome({
    user: user,
    home: home,
  });
  await fevHouse.save();
  return res
    .status(200)
    .json(new ApiResponse(200, fevHouse, "House Addded in Fav"));
});

const getfevHouse = asyncHandler(async (req, res) => {
  const fev = await FavHome.find({ user: req.user.id }).populate("home");
  return res
    .status(200)
    .json(new ApiResponse(200, fev, "Fev House Fetched SUccessfully"));
});

const deletefevHouse = asyncHandler(async (req, res) => {
  const home = await FavHome.findOneAndDelete({
    user: req.user.id,
    home: req.params.id,
  });
  if (!home) {
    throw new ApiError(400, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "FavHouse Deleted Successfully"));
});

export {
  createHouse,
  getHouse,
  getHouseById,
  updateHouse,
  deleteHouse,
  addfevHouse,
  getfevHouse,
  deletefevHouse,
};
