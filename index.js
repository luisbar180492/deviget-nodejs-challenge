const PORT = process.env.PORT || 3001
const express = require('express')
const path = require('path')
const app = express()
const publicPath = path.join(__dirname, '/public')
const room = {
  playerOne: undefined,
  playerTwo: undefined,
}

app.use(express.static(publicPath))
app.get('/', (req, res) => res.sendFile(`${publicPath}/index.html`))
const server = app.listen(PORT, () => console.log(`Server running on ${PORT}`))

const io = require('socket.io')(server, {
  cors: {
    origin: ['http://localhost:3000', 'https://deviget-react-challenge.herokuapp.com'],
  },
})

const onMessage = (data, ack) => {
  if (room.playerOne.id === data.socketId)
    return room.playerTwo.send(data, () => ack())
  if (room.playerTwo.id === data.socketId)
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
  room.playerOne.emit('ready', { playerOne: room.playerOne.id, playerTwo: room.playerTwo.id })
  room.playerTwo.emit('ready', { playerOne: room.playerOne.id, playerTwo: room.playerTwo.id })
})