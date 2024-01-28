import { Router } from "express";
import { postComment } from "../controllers/contentPostComment.js";

const router = Router();

router.route("/ContentPostComment/:owner").post(postComment);

export default router;
