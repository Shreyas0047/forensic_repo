const User = require("../models/User");
const AppError = require("../utils/AppError");
const { verifyToken } = require("../utils/tokenUtils");

async function authenticateUser(req, res, next) {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required.", 401);
    }

    const token = authorizationHeader.split(" ")[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      throw new AppError("User not found.", 401);
    }

    req.user = {
      _id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired authentication token.", 401));
    }

    return next(error);
  }
}

module.exports = {
  authenticateUser,
};
