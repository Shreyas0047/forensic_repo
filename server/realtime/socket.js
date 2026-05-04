let ioInstance = null;

function initializeSocket(server, options = {}) {
  const { Server } = require("socket.io");

  ioInstance = new Server(server, {
    cors: {
      origin: options.clientUrl || process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  ioInstance.on("connection", (socket) => {
    socket.emit("CONNECTED", { status: "connected" });
  });

  return ioInstance;
}

function emitAlert(eventName, payload) {
  if (!ioInstance) {
    return;
  }

  ioInstance.emit(eventName, payload);
}

module.exports = {
  initializeSocket,
  emitAlert,
};
