import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

type RoomCodes = Record<string, string>; // SocketID - RoomCode

type RoomUsers = {
  [roomCode: string]: string[];
};

const roomUsers: RoomUsers = {};
const roomCodes: RoomCodes = {};

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
    roomCodes[socket.id] = roomCode;
    roomUsers[roomCode] = [socket.id];
    console.log(`User created room: ${socket.id} - ${roomCode}`);
    socket.emit('roomCode', roomCode);

    io.to(roomCode).emit('usersInRoom', roomUsers[roomCode]);
  });
  
  socket.on('joinRoom', (roomCode: string) => {
    socket.join(roomCode);
    console.log(`User joined room: ${roomCode} (by ${socket.id})`);
    socket.emit('roomCode', roomCode);

    roomUsers[roomCode].push(socket.id);
    io.to(roomCode).emit('usersInRoom', roomUsers[roomCode]);
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
  const numero = Math.floor(Math.random() * 10000);
  return numero.toString().padStart(4, '0');
}
