import mongoose from "mongoose";

const homeSchema = new mongoose.Schema({
  title: { type: String },
  numberOfRooms: { type: Number },
  title: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  noOfRooms: {
    type: Number,
    required: true,
  },
  area: {
    type: String,
    // required: true,
  },
  images: [
    {
      type: String,
    },
  ],
  price: {
    rent: {
      type: Number,
      // required: true,
    },
    buy: {
      type: Number,
      // required: true,
    },
  },
  owner: {
    name: {
      type: String,
      // required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    contact: {
      type: String,
      // required: true,
    },
  },
  facilities: {
    kitchen: {
      type: Boolean,
      default: false,
    },
    parking: {
      type: Boolean,
      default: false,
    },
    wifi: {
      type: Boolean,
      default: false,
    },
    marketplace: {
      type: Boolean,
      default: false,
    },
    canteen: {
      type: Boolean,
      default: false,
    },
    hospital: {
      type: Boolean,
      default: false,
    },
    transportation: {
      type: Boolean,
      default: false,
    },
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  neighborhoodInfo: {
    type: String,
  },
  publicReviews: [
    {
      reviewer: {
        name: String,
        photo: String,
      },
      comment: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});



export const Home = mongoose.model("Home", homeSchema);
