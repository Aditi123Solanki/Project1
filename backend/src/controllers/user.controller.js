import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async (req,res) =>{




    // get user details from frontend
    const {fullname,email,username,password} =req.body





    // validation - not empty
    if(
        [fullname,email,username,password].some((field)=>
        field?.trim() === ""
        )){
            throw new ApiError(400,"Enter all the fields")
        }

    // if(fullname===""){
    //     throw new ApiError(400,"Full name is Required")
    // } we can continue to do the same for every entry 
    // or follow above syntax





    // check if user already exist: Username, Email
    const existedUser =  await User.findOne({
         $or: [{username}, {email}]
    })
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist")
    }




    // check for images, check of avtar
    const avatarLocalPath = req.files?.avatar[0]?.path

    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }



    if(!avatarLocalPath){
        throw new ApiError(400,"Avatat is Required")
    }




    // upload them to cloudinary
    const avatar = await  uploadOnCloudinary(avatarLocalPath)
    const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : { url: "" };






    // create user object - create entry in DB
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }



    // remove password and refreash token filed
    const user = await User.create({
        fullname,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })




    // check for user creation 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }





    // return response else return error
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registerd Sucessfully")
    )


})

export {registerUser}