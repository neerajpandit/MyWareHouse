import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import {sendOTP} from "../utils/otpSend.js";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token"
    );
  }
};

//user Registeration
const registerUser = asyncHandler(async (req, res) => {
  const { phoneNo,email, username, role, password } = req.body;
  //console.log("email: ", email);

  if (
    [phoneNo,email, username, role, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username,phoneNo }],
  });

  if (existedUser) {
    throw new ApiError(409, "Username with email or phoneNo already exists");
  }
  
  const generateOTP = () => {
    // Define the length of the OTP
    const otpLength = 6;
  
    // Generate a random OTP
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += Math.floor(Math.random() * 10); // Random digit between 0 and 9
    }
  
    return otp;
  };
  const otp = generateOTP();
  sendOTP(phoneNo, otp)
  const user = await User.create({
    username,
    phoneNo,
    email,
    password,
    savedOTP:otp,
    role: role || "user",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

// Verify SMS OTP
const verifyUser = async (req, res) => {
    const { phoneNo, savedOTP } = req.body;
  
    try {
      // Find user by phone number and OTP
      const user = await User.findOne({ phoneNo, savedOTP });
  
      if (!user) {
        return res.status(404).json({ error: "Invalid OTP" });
      }
  
      // Mark phone number as verified
      user.isPhoneVerified = true;
      savedOTP='';
      await user.save();
  
      res.status(200).json({ message: "Phone number verified successfully" });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Failed to verify OTP" });
    }
  };

//user Login
const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { username, password } = req.body;
  // console.log(email);

  if (!password && !username) {
    throw new ApiError(400, "password or email is required");
  }



  const user = await User.findOne({
    $or: [{ username }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  if (!user.isPhoneVerified) {
    throw new ApiError(401, "PhoneNO not verified");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

//user Login via Phone No
// Step 1: Request OTP
const requestOTP = asyncHandler(async (req, res) => {
  const { phoneNo } = req.body;

  if (!phoneNo) {
    throw new ApiError(400, "Phone number is required");
  }

  // Generate and send OTP to the user's phone number (You need to implement this function)
  const generateOTP = () => {
    // Define the length of the OTP
    const otpLength = 6;
  
    // Generate a random OTP
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += Math.floor(Math.random() * 10); // Random digit between 0 and 9
    }
  
    return otp;
  };
  const otp = generateOTP();
  const message = `Dear Customer, Your OTP for mobile number verification is ${otp}. Please do not share this OTP to anyone - BookMyWareHouse`;
        
  //sendOTP(phoneNo, otp)
  sendOTP(phoneNo, message)

  // Save the OTP in user's session or database for verification later
  // For simplicity, let's assume we're storing it in memory
  req.session.phoneNo = phoneNo;
  req.session.otp = otp;

  return res.status(200).json(new ApiResponse(200, { phoneNo }, "OTP sent successfully"));
});

// Step 2: Verify OTP and Login
const verifyOTPAndLogin = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const phoneNo = req.session.phoneNo;

  if (!otp) {
    throw new ApiError(400, "OTP is required");
  }

  if (!phoneNo) {
    throw new ApiError(400, "Phone number not found in session");
  }

  const savedOTP = req.session.otp;

  if (otp !== savedOTP) {
    throw new ApiError(401, "Invalid OTP");
  }

  // At this point, OTP is verified successfully
  // You may want to clear the OTP from the session after successful verification
  delete req.session.otp;
  // Find user by phone number
  const user = await User.findOne({ phoneNo });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if phone is verified
  if (!user.isPhoneVerified) {
    throw new ApiError(401, "Phone not verified");
  }

  // Generate access and refresh tokens
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  // Get user details excluding sensitive information
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // Set cookies and send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

//logout User
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

//deleteuser Account 
const deleteAccount = asyncHandler(async (req, res) => {
  const { phoneNo } = req.body;

  if (!phoneNo) {
    throw new ApiError(400, "Phone number not found in session");
  }

  // Find user by phone number
  const user = await User.findOne({ phoneNo });

  if (!user) {
    throw new ApiError(404, "User not found Enter Correct PhoneNo");
  }

  // Ensure that the current user matches the user to be deleted
  const activeUserId = req.user._id; // Assuming you have middleware to set req.user

  if (user.id.toString() !== activeUserId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this account");
  }

  // Your logic to delete the user's account
  await User.deleteOne({ _id: user.id });

  return res.status(200).json({ message: "Account deleted successfully" });
});

//Request For Phone Forgot Otp
const requestOTPForgotPassword = asyncHandler(async (req, res) => {
  const { phoneNo } = req.body;

  if (!phoneNo) {
    throw new ApiError(400, "Phone number is required");
  }
  const user = await User.findOne({ phoneNo });

  if (!user.isPhoneVerified) {
    throw new ApiError(401, "Phone not verified");
  }

  // Generate and send OTP to the user's phone number (You need to implement this function)
  const generateOTP = () => {
    // Define the length of the OTP
    const otpLength = 5;
  
    // Generate a random OTP
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += Math.floor(Math.random() * 10); // Random digit between 0 and 9
    }
  
    return otp;
  };
  const otp = generateOTP();
  //const message = `Dear Customer, Your OTP for Reset Password is ${otp}. Please do not share this OTP to anyone - BookMyWareHouse`;
        
  sendOTP(phoneNo, otp)
  // sendOTP(phoneNo, message)

  // Save the OTP in user's session or database for verification later
  // For simplicity, let's assume we're storing it in memory
  // await User.findOneAndUpdate({ savedOTP:otp });
  user.savedOTP=otp;
  await user.save()

  return res.status(200).json(new ApiResponse(200, { phoneNo }, "OTP sent successfully"));
});

//verify SMS or Email Both OTP
const verifyOTP = asyncHandler(async (req, res) => {
  const { emailOrPhone,otp } = req.body;
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phoneNo: emailOrPhone }]
  });
  
  if (!otp) {
    throw new ApiError(400, "OTP is required");
  }

  // const user = await User.findOne({ phoneNo });

  // Check if phone is verified
  if (!user.isPhoneVerified) {
    throw new ApiError(401, "Phone not verified");
  }
  if (otp !== user.savedOTP) {
    throw new ApiError(401, "Invalid OTP");
  }

  // Set cookies and send response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Otp Verify successfully"
      )
    );
});

//verify Email OTP
// const verifyEmailOTP = asyncHandler(async (req, res) => {
//   const { email,otp } = req.body;

//   if (!otp) {
//     throw new ApiError(400, "OTP is required");
//   }

//   if (!email) {
//     throw new ApiError(400, "Emailis required");
//   }

//   const user = await User.findOne({ email });

//   // Check if phone is verified
//   if (!user.isPhoneVerified) {
//     throw new ApiError(401, "Phone not verified");
//   }
//   if (otp !== user.savedOTP) {
//     throw new ApiError(401, "Invalid OTP");
//   }

//   // Set cookies and send response
//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         "Otp Verify successfully"
//       )
//     );
// });

const sendMail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    // secure: flase,
    requireTLS:true,
    // service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  try {
    console.log(process.env.EMAIL_PASS)
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
//email Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Generate OTP (One-Time Password)
  const generateOTP = () => {
    // Define the length of the OTP
    const otpLength = 6;
  
    // Generate a random OTP
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
      otp += Math.floor(Math.random() * 10); // Random digit between 0 and 9
    }
  
    return otp;
  };
  const otp = generateOTP();
  const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    console.log(otp)
  // Encode the OTP in JWT
  // user.passwordResetOTP = otp;
  user.savedOTP=otp;
  await user.save();
  // Send the OTP via email
  try {
    console.log("its call function")
    await sendMail(email, 'Password Reset OTP', `Your OTP for password reset is: ${otp}`);
    res.status(200).json( `${otp}` );
  } catch (error) {
    console.error('Error sending OTP:', error,);
    res.status(500).json({ message: 'Failed to send OTP via email' });
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { emailOrPhone,newPassword } = req.body;
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phoneNo: emailOrPhone }]
  });
  // const isCorrect = await user.isPasswordCorrect(oldPassword)

  if (!user) {
    throw new ApiError(400, "Invalid Email write valid code");
  }

  user.password = newPassword;

  user.otp = null;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { firstName, lastName, phoneNo, email, gender, birthday } = req.body;

  if (!firstName && !lastName && !phoneNo && !email && !gender && !birthday) {
    throw new ApiError(400, "fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        firstName: firstName,
        lastName: lastName,
        phoneNo: phoneNo,
        email: email,
        gender: gender,
        birthday: birthday,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});


export {
  registerUser,
  loginUser,
  logoutUser,
  requestOTP,
  verifyOTPAndLogin,
  deleteAccount,
  requestOTPForgotPassword,
  verifyOTP,
  refreshAccessToken,
  changeCurrentPassword,
  // changeCurrentPhoneNo,
  getCurrentUser,
  updateAccountDetails,
  forgotPassword,
  verifyUser,
  resetPassword,
  
};
