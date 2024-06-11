const express = require('express')
const app = express()
const port = 5000
const NodeMediaServer = require('node-media-server')
const cors = require('cors')

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: '*',
  },
}

const nms = new NodeMediaServer(config)
nms.run()

app.use(express.json())
app.use(cors())

const totens = [
  {
    id: 1,
    videoUrl: 'https://monitoring-upy8.onrender.com/live/raspberry1/index.m3u8',
    controlUrl: 'http://toten1/control',
  },
  {
    id: 2,
    videoUrl: 'https://monitoring-upy8.onrender.com/live/raspberry2/index.m3u8',
    controlUrl: 'http://toten2/control',
  },
  // Agregar más tótems según sea necesario
]

app.get('/api/totens', (req, res) => {
  res.json(totens)
})

app.post('/api/totens/:id/control', (req, res) => {
  const { id } = req.params
  const { device } = req.body
  const toten = totens.find((t) => t.id == id)
  if (toten) {
    // Aquí se realizarían las acciones necesarias para controlar los dispositivos
    res.status(200).send(`Dispositivo ${device} controlado en Tótem ${id}`)
  } else {
    res.status(404).send('Tótem no encontrado')
  }
})

app.listen(port, () => {
  console.log(`Servidor de API corriendo en http://localhost:${port}`)
})
