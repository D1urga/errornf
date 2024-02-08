import { Router } from "express";
import {
  getContentPost,
  postContentPost,
  postPicturePost,
} from "../controllers/post.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/postContentPost/:owner")
  .post(upload.fields([{ name: "content", maxCount: 1 }]), postContentPost);
router
  .route("/postPicturePost/:owner")
  .post(upload.fields([{ name: "content", maxCount: 1 }]), postPicturePost);
router.route("/getContentPost").get(getContentPost);

export default router;
