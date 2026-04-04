

// function checkPermission(permission) {
//   return function (req, res, next) {

//     if (!req.user || !req.user.role) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     console.log("kya huaa bhai ",req.user)
//     console.log("kya huaa permissions ",req.permissions)

//     // 🔥 ADMIN = ALL PERMISSIONS
//     if (
//       req.user.role.name === "admin" ||
//       req.user.role.name === "Super Admin" ||
//       req.user.role.isAdmin === true
//     ) {
//       return next();
//     }

//     const userPermissions = req.permissions || [];

//     if (!userPermissions.includes(permission)) {
//       return res.status(403).json({ message: "Permission denied" });
//     }

//     next();
//   };
// }

// export default checkPermission;








function checkPermission(permission) {
  return function (req, res, next) {

    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const roleName = req.user.role.name?.toLowerCase();
    console.log("kya huaa bhai ", req.user)
    console.log("kya huaa permissions ", req.permissions)
    // 🔥 ADMIN = ALL ACCESS
    if (roleName === "super admin" || req.user.role.isAdmin === true) {
      return next();
    }

    const userPermissions = Array.isArray(req.permissions)
      ? req.permissions
      : [];

    console.log("kya huaa permissions sdfd", userPermissions)


    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    return next();
  };
}

export default checkPermission;
