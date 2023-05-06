const io = require("socket.io")(8900, {
  cors: { origin: "http://localhost:3000" },
});

let users = [];

const addUser = (userId, socketId) => {
  // only push when userId is not exist in the list
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const deleteUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("a user connected");

  // when connect
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  // send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    io.to(user.socketId).emit("getMessage", {
      senderId,
      text,
    });
  });

  // when disconnect
  socket.on("disconnect", () => {
    deleteUser(socket.id);
    io.emit("getUsers", users);
    console.log("a user disconnected");
  });
});
