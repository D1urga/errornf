import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ContentPost",
    },
  },
  { timestamps: true }
);

export const ContentPostComment = mongoose.model(
  "ContentPostComment",
  commentSchema
);
