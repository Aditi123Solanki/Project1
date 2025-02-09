import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userShcema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avtar: {
      type: String, //cloudinary url
      required: true,
    },
    coverImage: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: ture }
);

userShcema.pre("save",async function(next){ // advised not to use arrow funtion as we need to know the context
  if(!this.isModified("password")) return next();
    this.password = bcrypt.hash(this.password,10)
    next()
})

userShcema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password,this.password)
}

userShcema.methods.generateAccessToken = function(){
  return jwt.sign({
    _id: this._id,
    email:this.email,
    username:this.username,
    fullname:this.fullname
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  }
)
}

userShcema.methods.generateRefreshToken = function(){
  return jwt.sign({
    _id: this._id,
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  }
)
}

export const User = new mongoose.model("User", userShcema);
