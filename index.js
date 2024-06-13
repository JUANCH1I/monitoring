const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const wrtc = require('wrtc')

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

let peers = {}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)
  peers[socket.id] = { socket }

  socket.on('offer', async (data) => {
    const { sdp, to } = data
    console.log('Received offer from:', socket.id)

    if (peers[to]) {
      const peer = new wrtc.RTCPeerConnection()
      peers[socket.id].peer = peer
      peers[socket.id].senderStream = new wrtc.MediaStream()

      peer.ontrack = (event) => {
        peers[socket.id].senderStream.addTrack(event.track)
      }

      await peer.setRemoteDescription(new wrtc.RTCSessionDescription(sdp))
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      socket.emit('answer', { sdp: peer.localDescription, from: socket.id })

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('candidate', { candidate: event.candidate, to })
        }
      }
    }
  })

  socket.on('answer', async (data) => {
    const { sdp, to } = data
    if (peers[to] && peers[to].peer) {
      await peers[to].peer.setRemoteDescription(
        new wrtc.RTCSessionDescription(sdp)
      )
    }
  })

  socket.on('candidate', async (data) => {
    const { candidate, to } = data
    if (peers[to] && peers[to].peer) {
      await peers[to].peer.addIceCandidate(new wrtc.RTCIceCandidate(candidate))
    }
  })

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id)
    delete peers[socket.id]
  })
})

const PORT = process.env.PORT || 4000 // Cambia el puerto aquí
server.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`)
})
