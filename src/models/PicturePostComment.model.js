import mongoose from "mongoose";

const PictureCommentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PicturePost",
    },
  },
  { timestamps: true }
);

export const PicturePostComment = mongoose.model(
  "PicturePostComment",
  PictureCommentSchema
);
