import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  approveFollower,
  follow,
  followingPosts,
  getAllusers,
  getCurrentUser,
  getCurrentusers,
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
router.route("/allUsers/:currentUser").get(getAllusers);
router.route("/currentUser/:user").get(getCurrentusers);
router.route("/follow/:followTo/:follower").post(follow);
router.route("/followingPost/:id").get(followingPosts);
router.route("/approveFollower/:followerId").post(approveFollower);

export default router;
