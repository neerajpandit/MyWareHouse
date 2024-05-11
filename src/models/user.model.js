import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      index: true,
    },
    username: {
        type: String,
        required: true,
        // unique: true,
        lowecase: true,
        trim: true,
      },
    email: {
      type: String,
    //   required: true,
    //   unique: true,
      lowecase: true,
      trim: true,
    },
    phoneNo: {
      type: String,
      //required: true,
      trim: true,
    },

    password: {
      type: String,
      //required: [true, "Password is required"],
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
    },
    savedOTP: {
      type: String,
    },
    isPhoneVerified: {
        type: Boolean,
        default: false
    },
    otpExpiration: {
      type: Date,
    },
    refreshToken: {
      type: String,
    },
    googleId: {
      type: String,
      required: true, 
      unique: true },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.methods.setOTP = function (otp) {
  this.otp = otp;
  // Set expiration time for OTP (e.g., 10 minutes)
  this.otpExpiration = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in milliseconds
};

userSchema.methods.verifyOTP = function (otp) {
  // Check if OTP matches and has not expired
  return this.otp === otp && this.otpExpiration && this.otpExpiration > new Date();
};
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      phoneNo: this.phoneNo,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
