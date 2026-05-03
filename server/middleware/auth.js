const { authenticateUser } = require("./authMiddleware");

module.exports = {
  protect: authenticateUser,
};
