import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ContentPost } from "../models/contentPost.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const postContentPost = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "all fields required");
  }
  const { owner } = req.params;
  if (!owner) {
    throw new ApiError(400, "owner required");
  }

  const contentLocalPath = req.files?.content[0]?.path;
  if (!contentLocalPath) {
    throw new ApiError(400, "content local file is required");
  }
  const contentFile = await uploadOnCloudinary(contentLocalPath);
  if (!contentFile) {
    throw new ApiError(400, "content file is required");
  }
  const urlVar = contentFile.url.slice(0, 4) + "s" + contentFile.url.slice(4);
  const contentPostData = await ContentPost.create({
    title,
    content: urlVar,
    description,
    owner,
  });
  if (!contentPostData) {
    throw new ApiError(500, "something went wrong");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, contentPostData, "post sent successfully"));
});

const getContentPost = asyncHandler(async (req, res) => {
  const contentPostData = await ContentPost.aggregate([
    {
      $lookup: {
        localField: "owner",
        foreignField: "_id",
        from: "users",
        as: "Parentuser",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        localField: "_id",
        foreignField: "owner",
        from: "contentpostcomments",
        as: "comments",
      },
    },
    { $addFields: { totalComments: { $size: "$comments" } } },
  ]);
  return res
    .status(201)
    .json(new ApiResponse(200, contentPostData, "data successfully fetched"));
});

export { postContentPost, getContentPost };
