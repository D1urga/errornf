import mongoose from "mongoose";

const followerFollowingSchema = new mongoose.Schema(
  {
    followTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);

export const FollowerFollowing = mongoose.model(
  "FollowerFollowing",
  followerFollowingSchema
);
