import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import pollRoutes from './routes/poll.routes.js';
import { setIO } from './controller/poll.controller.js';


dotenv.config();

const app = express();
const httpServer = createServer(app);


const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setIO(io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join poll room
  socket.on('joinPoll', (pollId: string) => {
    socket.join(`poll:${pollId}`);
    console.log(`Client ${socket.id} joined poll:${pollId}`);
  });

  // Leave poll room
  socket.on('leavePoll', (pollId: string) => {
    socket.leave(`poll:${pollId}`);
    console.log(`Client ${socket.id} left poll:${pollId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


app.use('/api/polls', pollRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});


const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Socket.io server ready`);
  console.log(` CORS enabled for: ${FRONTEND_URL}`);
});
