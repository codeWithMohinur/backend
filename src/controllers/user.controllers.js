import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    console.log("TOKEN ERROR:", error);
    throw new apiError(
      500,
      "Something went wrong while generate access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details
  // check validation
  // check user already exist yes or no - using userName , email
  // check for image, avatar
  // upload on cloudinary - avatar
  // create a users object - create entry in db
  // removed password and refresh token in filed from response
  // check for user creation
  // return res

  // get user details
  const { fullName, email, password, userName, watchHistory } = req.body;

  // check validation
  if (
    [fullName, userName, email, password].some((field) => field?.trim() === "")
  ) {
    return new apiError(400, "All field is required");
  }

  // check user already exist yes or no - using userName , email
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new apiError(409, "user with userName or email is already exists");
  }

  // check for image, avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  // upload on cloudinary - avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, "Avatar file is must be required");
  }

  // create a users object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    userName: userName.toLowerCase(),
    email,
    password,
  });

  // removed password and refresh token in filed from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new apiError(500, "something went wrong while registering the user");
  }

  // return res
  return res
    .status(201)
    .json(new apiResponse(201, createdUser, "User Registered is successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get user details
  // check validation using email and userName
  // find user
  // check password
  // generate access and refresh token
  // send cookies

  const { userName, email, password } = req.body;

  if (!userName && !email) {
    throw new apiError(400, "Please enter a valid username or email");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new apiError(404, "User not register or user dose not exists");
  }

  const isPassword = await user.isPasswordCorrect(password);

  if (!isPassword) {
    throw new apiError(
      401,
      "password is wrong please enter a correct password"
    );
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User login is successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
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
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User loggedOut successfully"));
});

export { registerUser, loginUser, logoutUser };
