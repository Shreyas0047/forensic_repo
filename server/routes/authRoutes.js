const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login } = require("../controllers/authController");
const {
  registerValidationRules,
  loginValidationRules,
  handleValidationErrors,
} = require("../middleware/validationMiddleware");

const router = express.Router();

const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests. Please try again later.",
  },
});

router.use(authRateLimiter);

router.post("/register", registerValidationRules, handleValidationErrors, register);
router.post("/login", loginValidationRules, handleValidationErrors, login);

module.exports = router;
