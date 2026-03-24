// import jwt from "jsonwebtoken"


// const sendToken=(user,statusCode,res)=>{
//     const token=jwt.sign(user._id,process.env.JWT_SECRET,{
//         expiresIn:process.env.JWT_EXPIRE
//     })
// // options for cookie
// const options = {
//     expires: new Date(
//       Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//   };

//   res.status(statusCode).cookie("token", token, options).json({
//     success: true,
//     user,
//     token,
//   });

// }

// export default sendToken


// import jwt from "jsonwebtoken";

// const sendToken = (user, statusCode, res) => {
//   const token = jwt.sign(
//     { id: user._id }, // ✅ Correct payload format
//     process.env.JWT_SECRET,
//     {
//       expiresIn: process.env.JWT_EXPIRE,
//     }
//   );

//   // Cookie options
//   const options = {
//     expires: new Date(
//       Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
//     ),
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production", // for HTTPS in production
//     sameSite: "Strict", 
//   };

//   res
//     .status(statusCode)
//     .cookie("token", token, options)
//     .json({
//       success: true,
//       user,
//       token,
//     });
// };

// export default sendToken;



import jwt from "jsonwebtoken";

const sendToken = (user, statusCode, res) => {
  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );

  // Cookie options
  console.log("Send Cookie" ,user)
  console.log("Token me kya",token)

  const options = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user,
      token,
    });
};

export default sendToken;
