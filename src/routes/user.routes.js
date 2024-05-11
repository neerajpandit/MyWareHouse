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
router.route("/resetPassword").post(resetPassword)
//email forgot
router.route("/emailforgotpassword").post(forgotPassword);

//Google Auth
router.route('/auth/google')
  .get(passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route for Google callback after authentication
router.route('/auth/google/callback')
  .get(passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/log');
  });

// Route for logging out
router.route('/auth/logout')
  .get((req, res) => {
    req.logout();
    res.redirect('/');
  });

router.route('/').get((req, res) => {
    res.render('login')
  })
router.get("/log", async(req,res)=>{
    res.render('index',{userinfo:req.user})
})

export default router;
