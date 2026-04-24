import User from "../models/userModel.js";
import sendToken from "../utils/sendToken.js";
import bcrypt from "bcrypt"

import fs from 'fs';
import path from 'path';
import crypto from "crypto";
import { sendOTPEmail } from "../utils/sendOTPEmail.js";

import { fileURLToPath } from "url";
// import { io } from "../server.js";
import Notification from "../models/notificationModel.js";
import { use } from "react";
import RolePermissionModel from "../models/RolePermissionModel.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// export const register = async (req, res) => {
//   const { name, email, phone, password, city } = req.body;

//   console.log("Registering user:", name, email, phone, password,city);

//   try {
//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered",
//       });
//     }


//     const isPasswordHash = await bcrypt.hash(password, 10)

//     const user = await User.create({ name, email, phone, password: isPasswordHash, city });

//     sendToken(user, 200, res)

//     // res.status(201).json({
//     //   success: true,
//     //   message: "User registered successfully",
//     //   data: user,
//     // });
//   } catch (error) {
//     console.error("Registration error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error during registration",
//     });
//   }
// };





export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const subject = "OTP for Email Verification"
    const message = `<p>Your OTP is <b>${otp}</b>. It will expire in 10 minutes.</p>`

    // Try sending OTP first
    try {
      await sendOTPEmail(email, subject, message);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return res.status(400).json({
        success: false,
        message: "Invalid email address or email could not be sent. Please enter a valid email.",
      });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: username,
      email,
      password,
      otp,
      otpExpires,
      isVerified: false,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Please verify to complete registration.",
      userId: user._id,
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};


export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    sendToken(user, 200, res);

  } catch (error) {
    console.error("OTP Verification Error:", error);
    res.status(500).json({ success: false, message: "Error verifying OTP" });
  }
};



export const login = async (req, res) => {

  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "Please Enter Email & Password"
      });     
    }
    console.log("Hello bhai mere ,", email, password)

    const user = await User.findOne({ email }).populate("role");

    // console.log(user)

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    if (user.isVerified === false) {
      return res.status(403).json({
        success: false,
        message: "User Not Verified Please Verify"
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(403).json({
        success: false,
        message: "Password does not match"
      });
    }

    user.password = undefined;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Try sending OTP first
    // try {
    //   await sendOTPEmail(email, otp);
    // } catch (emailError) {
    //   console.error("Email sending failed:", emailError);
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid email address or email could not be sent. Please enter a valid email.",
    //   });
    // }
    // res.status(200).json({
    //   success: true,
    //   message: "OTP sent to your email. Please verify to complete Login.",
    //   userId: user._id,
    // });

    sendToken(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
}


export const logout = async (req, res) => {
  // const { name, email, mobile, whatAppNo, lname, password } = req.body;

  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
};


export const getAllUser = async (req, res) => {
  try {
    // const users = await User.find().populate("role").sort({ createdAt: -1 });
    const users = await User.find({ restaurant: { $exists: true, $ne: null } })
      .populate("restaurant", "name outletCode")
      .populate("role", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Users Not Found",
      });
    }

    res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching users",
    });
  }
};



export const updateUser = async (req, res) => {
  const {
    name, email, phone, password, role,
    gender, DOB, address, department,
    designation, dateOfJoining, status
  } = req.body;

  const file = req.file;
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User does not exist"
      });
    }

    let updatedProfilePic = user.profilePic;

    if (file && file.filename !== user.profilePic) {
      const oldFilePath = path.join("uploads", user.profilePic);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
        console.log("Old profile pic deleted:", user.profilePic);
      }

      updatedProfilePic = file.filename;
    }

    const updatedData = {
      name,
      email,
      phone,
      password,
      role,
      gender,
      DOB,
      address,
      department,
      designation,
      dateOfJoining,
      profilePic: updatedProfilePic,
      status
    };

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true
    });

    res.status(200).json({
      success: true,
      message: "User updated successfully!",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating user"
    });
  }
};



export const deleteUser = async (req, res) => {
  const id = req.body
  console.log(id)
  const user = await User.findById(req.params.id);
  console.log(user)



  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted successfully",
  });

}


// Forgot Password
export const forgotPassword = async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(401).json({
      success: false,
      message: `User Not Found`,
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `https://localhost:4000/api/v1/password/reset/${resetToken}`;
  const message = `Your password reset token is:\n\n ${resetPasswordUrl} \n\nIf you did not request this, please ignore.`;
  const subject = "SIM M2M - Password Reset"
  try {
    await sendOTPEmail(user.email, subject, message);

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const resetPassword = async (req, res, next) => {
  const resetToken = req.params.token || req.body.token;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    // return next(new ErrorHandler("Reset token is invalid or expired", 400));
    return res.status(401).json({
      success: false,
      message: `Reset token is invalid or expired`,
    });
  }

  if (req.body.password !== req.body.cpassword) {
    // return next(new ErrorHandler("Passwords do not match", 400));
    return res.status(401).json({
      success: false,
      message: `Passwords do not match`,
    });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
};


//Update USer password

export const updatePassword =
  async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if (!isPasswordMatched) {
      // return next(new ErrorHandler("Old password is incorrect", 401));
      return res.status(401).json({
        success: false,
        message: `Old password is incorrect`,
      });
    }

    if (req.body.password !== req.body.cpassword) {
      // return next(new ErrorHandler("Password does not match", 401));
      return res.status(401).json({
        success: false,
        message: `Password does not match`,
      });

    }
    user.password = req.body.password;

    await user.save()

    sendToken(user, 200, res)


    res.status(200).json({
      success: true,
      user,
    })
  }



export const getUserDetails = async (req, res, next) => {
  const user = await User.findById(req.user.id).populate("restaurant").populate("role");

  const allPermissions = await RolePermissionModel.find({ restaurant: user.restaurant._id, role: user.role._id });

  // console.log("Bhai user ko kya kya permission mili hai ", allPermissions);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id : ${req.user.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
    permissions: allPermissions.length > 0 ? allPermissions[0].permissions : [],
  });
};


// controllers/userController.js

export const updateRole = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Role updated successfully", user });
  } catch (error) {
    next(error);
  }
};

export const getSingleUser = async (req, res, next) => {

  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorHandler(`User does not exist with Id : ${req.params.id}`))
  }
  res.status(200).json({
    success: true,
    user,
  })

}


// KYC Request send 


// export const submitKYC = async (req, res) => {
//   const userId = req.user._id;
//   const { aadharNumber, pinNumber } = req.body;
//   const frontImage = req.files?.aadharFrontImage?.[0]?.filename;
//   const backImage = req.files?.aadharBackImage?.[0]?.filename;

//   if (!aadharNumber || !pinNumber || !frontImage || !backImage) {
//     return res.status(400).json({ message: "All KYC fields are required" });
//   }

//   // const hashedPin = await bcrypt.hash(pinNumber, 10);

//   const user = await User.findByIdAndUpdate(userId, {
//     aadharNumber,
//     pinNumber,
//     aadharFrontImage: frontImage,
//     aadharBackImage: backImage,
//     kycStatus: 'PENDING'
//   }, { new: true });

//   const admins = await User.find({ role: "admin" });

//   for (const admin of admins) {
//     const notification = new Notification({
//       sender: userId,
//       receiver: admin._id,
//       message: `${req.user.name} has submitted a KYC request.`,
//       type: "KYC"
//     });

//     await notification.save();
//     io.to((admin._id).toString()).emit("new_kyc", notification);
//   }


//   res.status(200).json({ message: "KYC submitted successfully", user });
// };


// Update Admin  KYC

export const updateKYCStatus = async (req, res) => {
  const { userId, status } = req.body;

  if (!['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  user.kycStatus = status;
  await user.save();

  const notification = new Notification({
    sender: req.user._id,
    receiver: userId,
    message: `Your KYC has been successfully verified.`,
    type: "KYC"
  });

  await notification.save();
  io.to((userId).toString()).emit("new_kyc", notification);

  res.status(200).json({ success: true, message: `KYC ${status.toLowerCase()}`, user });
};

// get Admin  KYC

export const getPendingKYCUsers = async (req, res) => {
  try {
    const users = await User.find({ kycStatus: "PENDING" })
      .select("name email aadharNumber aadharFrontImage aadharBackImage createdAt -password pinNumber kycStatus")
      .sort({ createdAt: -1 });  // 👈 Latest first

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching pending KYC users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending KYC users",
    });
  }
};




export const createAdminUser = async (req, res) => {
  const { name, email, password, status, isVerified, role, restaurant } = req.body;
  console.log(req.body)

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name,
      email,
      password: hashedPassword,
      status,
      isVerified,
      role,
      restaurant: restaurant
    });

    res.status(200).json({
      success: true,
      message: "User Create Success fully ..!",
      user: user,
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};



// Update User Role Permission

export const updateRolePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    console.log("user", data)
    console.log("user rfdgfdg", req.body)
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User module not found",
      });
    }

    user.name = data.name || user.name;
    user.role = data.role || user.role;
    user.status = data.status || user.status;
    user.isVerified = data.isVerified || user.isVerified;
    user.email = data.email || user.email;


    await user.save();
    res.status(200).json({
      success: true,
      message: "User module updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



export const getAllRestaurentUser = async (req, res) => {
  try {
    if (!req.user || !req.user.restaurant) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated or restaurant not found"
      });
    }
    // const users = await User.find().populate("role").sort({ createdAt: -1 });
    const users = await User.find({ restaurant: req.user.restaurant })
      .populate("restaurant", "name outletCode")
      .populate("role", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Users Not Found",
      });
    }

    res.status(200).json({
      success: true,
      users,
    });

  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching users",
    });
  }
};