import {asyncHandler} from "../utils/asyncHandler.js"
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {apiRequest} from "../utils/apiResponse.js"
const registerUser = asyncHandler(async(req, res) => {
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
    const {fullName, email, password, userName} = req.body
        console.log("fullName", fullName);
        console.log("email", email);

    // check validation     
    if(
        [fullName, userName, email, password].some((field) => 
        field?.trim() === "")
    ){
        return new apiError(400, "All field is required")
    }

    // check user already exist yes or no - using userName , email
    const existedUser = User.findOne({
        $or: [{ userName },{ email }]
    })
    if(existedUser){
        throw new apiError(409, "user with userName or email is already exists")
    }


    // check for image, avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }


    // upload on cloudinary - avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, "Avatar file is must be required")
    }



    // create a users object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        userName : userName.toLowerCase,
        email,
        password,
    })

    // removed password and refresh token in filed from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    // check for user creation
    if(!createdUser){
        throw new apiError(500, "something went wrong while registering the user")
    }



    // return res
    return res.statusCode(201).json(
        new apiResponse(200, createdUser, "User Registered is successfully")
    )
})

export {registerUser}