import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { chat} from "../controllers/chat.controller.js";

const router = Router();

router.route("/message/:conversationId").get(chat);



export default router;
