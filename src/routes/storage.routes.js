// const express = require("express");
import { Router } from "express";
import { getUploadUrl } from "../storage/storage.js";

const router = Router();

router.route("/getUrl").post(getUploadUrl);
export default router;
