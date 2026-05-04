require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDatabase = require("./config/db");
const { initializeSocket } = require("./realtime/socket");

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();

  const server = http.createServer(app);
  initializeSocket(server);

  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

startServer();
