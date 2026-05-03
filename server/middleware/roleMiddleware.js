const AppError = require("../utils/AppError");

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required before authorization.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("Forbidden: insufficient privileges.", 403));
    }

    return next();
  };
}

module.exports = {
  authorizeRoles,
};
