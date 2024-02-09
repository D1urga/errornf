import { Router } from "express";
import {
  postComment,
  postPictureComment,
} from "../controllers/contentPostComment.js";

const router = Router();

router.route("/ContentPostComment/:owner").post(postComment);
router.route("/PicturePostComment/:owner").post(postPictureComment);

export default router;
