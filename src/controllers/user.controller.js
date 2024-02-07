import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { FollowerFollowing } from "../models/followerFollowing.model.js";
import { FollowRequests } from "../models/followRequests.model.js";
import { ObjectId } from "bson";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;
  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "all fields required");
  }
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "user already exits");
  }
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering");
  }
  res
    .status(201)
    .json(new ApiResponse(200, createdUser, "user registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email required");
  }
  const user = await User.findOne({ $or: [{ username }, { email }] });
  if (!user) {
    throw new ApiError(404, "user does not exits");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      expires: new Date(Date.now() + 30 * 24 * 3600000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .cookie("refreshToken", refreshToken, {
      expires: new Date(Date.now() + 30 * 24 * 3600000),
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const getAllusers = asyncHandler(async (req, res) => {
  const { currentUser } = req.params;
  const objectId = new ObjectId(currentUser);

  const allUsers = await User.aggregate([
    {
      $lookup: {
        localField: "_id",
        foreignField: "followTo",
        from: "followerfollowings",
        as: "followers",
      },
    },
    {
      $lookup: {
        localField: "_id",
        foreignField: "owner",
        from: "contentposts",
        as: "allPost",
      },
    },
    { $addFields: { totalPost: { $size: "$allPost" } } },
    { $addFields: { totalFollowers: { $size: "$followers" } } },
    {
      $lookup: {
        localField: "_id",
        foreignField: "follower",
        from: "followerfollowings",
        as: "following",
      },
    },

    { $addFields: { totalFollowing: { $size: "$following" } } },
    {
      $addFields: {
        isFollowing: {
          $in: [objectId, "$followers.follower"],
        },
      },
    },
    {
      $lookup: {
        localField: "_id",
        foreignField: "followTo",
        from: "followrequests",
        as: "requests",
      },
    },
    {
      $addFields: {
        isRequested: {
          $in: [objectId, "$requests.follower"],
        },
      },
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, allUsers, "users sent successfully"));
});

const approveFollower = asyncHandler(async (req, res) => {
  const { followerId } = req.params;
  await FollowRequests.findByIdAndUpdate(followerId, {
    $set: {
      status: "approved",
    },
  });
  const data = await FollowRequests.findById(followerId);
  const approveddata = await FollowerFollowing.create({
    followTo: data.followTo,
    follower: data.follower,
    status: data.status,
  });

  res.status(200).json(new ApiResponse(200, approveddata, "approved"));
});

const follow = asyncHandler(async (req, res) => {
  const { followTo, follower } = req.params;
  if (!followTo && !follower) {
    throw new ApiError(400, "followTo follower are required");
  }

  const followerData = await FollowRequests.create({
    followTo,
    follower,
    status: "pending",
  });
  res
    .status(200)
    .json(new ApiResponse(200, followerData, "followed successfully"));
});

const followingPosts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const objectId = new ObjectId(id);
  const postdata = await User.aggregate([
    {
      $match: {
        _id: objectId,
      },
    },
    {
      $lookup: {
        from: "followerfollowings",
        localField: "_id",
        foreignField: "follower",
        as: "allFollowing",
        pipeline: [
          {
            $project: {
              followTo: 1,
            },
          },

          {
            $lookup: {
              localField: "followTo",
              foreignField: "owner",
              from: "contentposts",
              as: "allPost",
              pipeline: [
                {
                  $lookup: {
                    localField: "_id",
                    foreignField: "owner",
                    from: "contentpostcomments",
                    as: "comments",
                    pipeline: [
                      {
                        $project: {
                          comment: 1,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },

          {
            $unwind: "$allPost",
          },
        ],
      },
    },
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, postdata, "post sent successfully"));
});
export {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getAllusers,
  follow,
  followingPosts,
  approveFollower,
};
