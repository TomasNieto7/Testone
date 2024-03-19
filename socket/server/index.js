import {
  Server
} from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:3000"
  }
});

let onlineUsers = []

const addNewUser = (username, rol, socketId) => {
  !onlineUsers.some((user) => user.username === username && user.rol === rol) &&
    onlineUsers.push({
      username,
      rol,
      socketId
    })
}

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter(user => user.socketId !== socketId)
}

const getUser = (username, rol) => {
  return onlineUsers.find(user => user.username === username && user.rol === rol)
}

io.on("connection", (socket) => {

  socket.on("newUser", (username, rol) => {
    addNewUser(username, rol, socket.id)
  })

  socket.on("sendNotification", ({ senderName, receiverName, receiverRol, text }) => {
    const receiver = getUser(receiverName, receiverRol);
    if (receiver && receiver.socketId) {
      io.to(receiver.socketId).emit("getNotification", {
        senderName,
        text
      });
    } else {
      console.error("Receiver or receiver.socketId is undefined.");
    }
  });
  

  socket.on("disconnect", () => {
    removeUser(socket.id)
  })
});

io.listen(5000);