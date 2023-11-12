import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

type Rooms = Record<string, string>;

const rooms: Rooms = {};

app.get('/', (req, res) => {
  res.send('Socket.IO server is running!');
});

app.get('/test', (req, res) => {
  res.send('hello world!');
});

io.on('connection', (socket: Socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('createRoom', () => {
    const roomCode = generateRoomCode();
    socket.join(roomCode);
    rooms[socket.id] = roomCode;
    console.log(`User created room: ${roomCode}`);
    socket.emit('roomCode', roomCode);
  });

  socket.on('joinRoom', (room: string) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('file', (data: { room: string, file: string }) => {
    io.to(data.room).emit('file', data.file);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


function generateRoomCode() {
  return '0000'
}
