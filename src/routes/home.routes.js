import { Router } from "express";
import {
  addfevHouse,
  createHouse,
  deleteHouse,
  deletefevHouse,
  getHouse,
  getHouseById,
  getfevHouse,
  updateHouse,
} from "../controllers/home.controller.js";
import { createRating } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/addHome").post(createHouse);
router.route("/getHome").get(getHouse);
router.route("/getHomeById/:id").get(getHouseById);
router.route("/updateHome/:id").patch(updateHouse);
router.route("/deleteHome/:id").delete(deleteHouse);
router.route("/addfevHome/:id").post(verifyJWT, addfevHouse);
router.route("/getfevHome").get(verifyJWT, getfevHouse);
router.route("/deletefevHome/:id").delete(verifyJWT, deletefevHouse);
router.route("/addReview").post(verifyJWT, createRating);
// router.route("/get")

export default router;
