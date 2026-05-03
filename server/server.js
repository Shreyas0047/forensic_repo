require("dotenv").config();
const app = require("./app");
const connectDatabase = require("./config/db");

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
