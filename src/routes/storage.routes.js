// const express = require("express");
import { Router } from "express";
import { getUploadUrl,getFile } from "../storage/storage.js";
import { verifyJWT,isAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/getUrl").post(verifyJWT,isAdmin,getUploadUrl);

router.route("/storage/:type/:imageKey").get(getFile);
export default router;
