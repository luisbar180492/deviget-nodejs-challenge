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

const onMessage = (data, ack) => {
  if (room.playerOne.id === data.id)
    return room.playerTwo.send(data, () => ack())
  if (room.playerTwo.id === data.id)
    return room.playerOne.send(data, () => ack())

}

const onDisconnect = (socket) => (reason) => {
  if (room.playerOne && socket.id === room.playerOne.id) return room.playerOne = undefined
  if (room.playerTwo && socket.id === room.playerTwo.id) return room.playerTwo = undefined
}

io.on('connection', (socket) => {
  if (room.playerOne && room.playerTwo) return socket.emit('full')
  
  socket.on('message', onMessage)
  socket.on('disconnect', onDisconnect(socket))
  
  if (!room.playerOne) return room.playerOne = socket
  room.playerTwo = socket
  room.playerOne.emit('ready', { id: room.playerOne.id })
  room.playerTwo.emit('ready', { id: room.playerOne.id })
})

httpServer.listen(PORT, () => console.log(`Server running on ${PORT}`))