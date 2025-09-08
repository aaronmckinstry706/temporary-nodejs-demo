const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const clients = new Map();
let nextId = 1;

wss.on('connection', (ws) => {
  const id = `client-${nextId++}`;
  clients.set(ws, id);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'list') {
        const list = Array.from(clients.values());
        ws.send(JSON.stringify({ type: 'list', clients: list }));
      }
    } catch (err) {
      // ignore invalid messages
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Health check endpoint
app.get('/is-running', (req, res) => {
  res.send('OK');
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
