import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  approveFollower,
  follow,
  followingPosts,
  getAllusers,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/allUsers").get(getAllusers);
router.route("/follow/:followTo/:follower").post(follow);
router.route("/followingPost").get(followingPosts);
router.route("/approveFollower/:followerId").post(approveFollower);

export default router;
