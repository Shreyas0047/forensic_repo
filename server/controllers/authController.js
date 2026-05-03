const User = require("../models/User");
const EventLog = require("../models/EventLog");
const AppError = require("../utils/AppError");
const { generateToken } = require("../utils/tokenUtils");

function buildSafeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError("User with this email already exists.", 409);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "Investigator",
    });

    await EventLog.create({
      eventType: "USER_REGISTERED",
      entityType: "User",
      entityId: user._id,
      performedBy: user._id,
      metadata: {
        email: user.email,
        role: user.role,
      },
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: buildSafeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password.", 401);
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      throw new AppError("Invalid email or password.", 401);
    }

    const token = generateToken(user);

    await EventLog.create({
      eventType: "USER_LOGGED_IN",
      entityType: "User",
      entityId: user._id,
      performedBy: user._id,
      metadata: {
        email: user.email,
        role: user.role,
        ipAddress: req.ip,
      },
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: buildSafeUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};
