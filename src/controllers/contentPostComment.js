import { ContentPostComment } from "../models/ContentPostComment.model.js";
import { PicturePostComment } from "../models/PicturePostComment.model.js";

import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const postComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { owner } = req.params;
  if (comment.trim() === "") {
    throw new ApiError(400, "comment requird");
  }
  const commentData = await ContentPostComment.create({
    comment,
    owner,
  });
  res
    .status(201)
    .json(new ApiResponse(200, commentData, "comment posted successfully"));
});

const postPictureComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { owner } = req.params;
  if (comment.trim() === "") {
    throw new ApiError(400, "comment requird");
  }
  const commentData = await PicturePostComment.create({
    comment,
    owner,
  });
  res
    .status(201)
    .json(new ApiResponse(200, commentData, "comment posted successfully"));
});

export { postComment, postPictureComment };
