const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { logEvent } = require("./eventLogService");

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

async function registerUser(payload) {
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError("User already exists.", 409);
  }

  const user = await User.create(payload);
  await logEvent({
    action: "USER_REGISTERED",
    description: `User ${user.email} registered.`,
    entityType: "user",
    entityId: user._id,
    actorId: user._id,
  });

  return {
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid credentials.", 401);
  }

  await logEvent({
    action: "USER_AUTHENTICATED",
    description: `User ${user.email} signed in.`,
    entityType: "user",
    entityId: user._id,
    actorId: user._id,
  });

  return {
    token: signToken(user._id),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  registerUser,
  loginUser,
};
