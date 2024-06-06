import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  verifyUser,
  requestOTP,
  verifyOTPAndLogin,
  deleteAccount,
  requestOTPForgotPassword,
  verifyOTP,
  resetPassword,
  forgotPassword,
  updateAccountDetails,
  getCurrentUser

} from "../controllers/user.controller.js";
// import { googleAuth } from "../controllers/googleauth.controller.js";
import passport from 'passport';
const router = Router();
import { verifyJWT } from "../middlewares/auth.middleware.js";
router.route("/signup").post(registerUser);
router.route("/signin").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/verifyUser").post(verifyUser);
router.route("/requestotp").post(requestOTP);
router.route("/verifyandlogin").post(verifyOTPAndLogin);
router.route("/deleteAccount").delete(verifyJWT, deleteAccount);
router.route("/forgotpassword").post(requestOTPForgotPassword);
router.route("/veryfiOTP").post(verifyOTP);
router.route("/resetPassword").post(resetPassword);
router.route("/updateaccount").patch(verifyJWT,updateAccountDetails);
router.route("/getCurrentUser").get(verifyJWT,getCurrentUser)
//email forgot
router.route("/emailforgotpassword").post(forgotPassword);


export default router;
