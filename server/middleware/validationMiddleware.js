const { body, validationResult } = require("express-validator");

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((accumulator, [key, nestedValue]) => {
      const sanitizedKey = key.replace(/^\$+/g, "").replace(/\./g, "");
      accumulator[sanitizedKey] = sanitizeValue(nestedValue);
      return accumulator;
    }, {});
  }

  if (typeof value === "string") {
    return value.replace(/\u0000/g, "").trim();
  }

  return value;
}

function sanitizeRequest(req, res, next) {
  req.body = sanitizeValue(req.body);
  req.query = sanitizeValue(req.query);
  req.params = sanitizeValue(req.params);
  next();
}

const registerValidationRules = [
  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long."),
  body("email").trim().isEmail().withMessage("A valid email address is required.").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long.")
    .matches(/(?=.*[a-z])/)
    .withMessage("Password must include at least one lowercase letter.")
    .matches(/(?=.*[A-Z])/)
    .withMessage("Password must include at least one uppercase letter.")
    .matches(/(?=.*\d)/)
    .withMessage("Password must include at least one number."),
];

const loginValidationRules = [
  body("email").trim().isEmail().withMessage("A valid email address is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    success: false,
    message: "Validation failed.",
    errors: errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    })),
  });
}

module.exports = {
  sanitizeRequest,
  registerValidationRules,
  loginValidationRules,
  handleValidationErrors,
};
