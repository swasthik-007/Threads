import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
// import mongoose from "mongoose";

const getUserProfile = async (req, res) => {
  // We will fetch user profile either with username or userId
  // query is either username or userId
  //   const { query } = req.params;
  const { username } = req.params;

  //   try {
  //     let user;

  //     // query is userId
  //     if (mongoose.Types.ObjectId.isValid(query)) {
  //       user = await User.findOne({ _id: query })
  //         .select("-password")
  //         .select("-updatedAt");
  //     } else {
  //       // query is username
  //       user = await User.findOne({ username: query })
  //         .select("-password")
  //         .select("-updatedAt");
  //     }

  //     if (!user) return res.status(404).json({ error: "User not found" });

  //     res.status(200).json(user);
  //   } catch (err) {
  //     res.status(500).json({ error: err.message });
  //     console.log("Error in getUserProfile: ", err.message);
  //   }

  try {
    const user = await User.findOne({ username })
      .select("-password")
      .select("-updatedAt");
    if (!user) return res.status(400).json({ error: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserProfile: ", err.message);
  }
};
const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      });
    } else {
      res.status(400).json({ error: "invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("error in signupUser:", err.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid Username or password" });

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("error in loginUser:", err.message);
  }
};
const logoutUser = async (req, res) => {
  try {
    res.cookie("jwt", { maxAge: 1 });
    res.status(200).json({ message: "User logged out successfuly" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("error in loginUser:", err.message);
  }
};
const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);
    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ message: "You Cannot follow/Unfollow Yourself" });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not Found" });
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      //unfollowuser
      //modify the current user
      //modify the following array

      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      res.status(200).json({ message: "user unfollowed successffully" });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      res.status(200).json({ message: "user followed successffully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("error in followUnfollowUser:", err.message);
  }
};
const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  const userId = req.user._id;
  let { profilePic } = req.body;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    // if (profilePic) {
    //   if (user.profilePic) {
    //     await cloudinary.uploader.destroy(
    //       user.profilePic.split("/").pop().split(".")[0]
    //     );
    //   }

    //   const uploadedResponse = await cloudinary.uploader.upload(profilePic);
    //   profilePic = uploadedResponse.secure_url;
    // }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    // Find all posts that this user replied and update username and userProfilePic fields
    // await Post.updateMany(
    //   { "replies.userId": userId },
    //   {
    //     $set: {
    //       "replies.$[reply].username": user.username,
    //       "replies.$[reply].userProfilePic": user.profilePic,
    //     },
    //   },
    //   { arrayFilters: [{ "reply.userId": userId }] }
    // );

    // // password should be null in response
    // user.password = null;

    res.status(200).json({ message: "profile Updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in updateUser: ", err.message);
  }
};
export {
  getUserProfile,
  signupUser,
  loginUser,
  logoutUser,
  followUnfollowUser,
  updateUser,
};
