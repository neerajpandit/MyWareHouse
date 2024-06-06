import { Router } from "express";
import { createProduct, getProduct } from "../controllers/home.controller.js";
import { createRating } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/addHome").post(createProduct);
router.route("/getHome").get(getProduct);
router.route("/addReview").post(verifyJWT,createRating);
// router.route("/get")

export default router;
