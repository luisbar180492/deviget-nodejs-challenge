const PORT = process.env.PORT || 3001
const httpServer = require('http').createServer()
const io = require('socket.io')(httpServer, {
  cors: {
    origin: ['http://localhost:3000'],
  },
})

const room = {
  playerOne: undefined,
  playerTwo: undefined,
  board: [
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0],
  ],
}

io.on('connection', (socket) => {
  if (room.playerOne && room.playerTwo) return socket.disconnect(true)
  
  socket.on('message', (data, ack) => {
    if (room.playerOne.id === data.id)
      return room.playerTwo.send(data, () => ack())
    if (room.playerTwo.id === data.id)
      return room.playerOne.send(data, () => ack())

  })
  
  if (!room.playerOne) return room.playerOne = socket

  room.playerTwo = socket
})

io.on('disconnect', (socket) => {
  console.log(`disconnected`);
})

httpServer.listen(PORT, () => console.log(`Server running on ${PORT}`))