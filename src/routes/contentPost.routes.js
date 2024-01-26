import { Router } from "express";
import {
  getContentPost,
  postContentPost,
} from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/postContentPost/:owner")
  .post(upload.fields([{ name: "content", maxCount: 1 }]), postContentPost);
router.route("/getContentPost").get(verifyJWT, getContentPost);

export default router;
