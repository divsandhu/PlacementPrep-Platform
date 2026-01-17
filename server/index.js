// server/index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import roomsRouter from "./routes/rooms.js";
import initSocketHandlers from "./socketHandlers/index.js";
import { socketAuth } from "./middleware/auth.js";
import roomManager from "./managers/roomManager.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/rooms", roomsRouter);

const server = http.createServer(app);
const io = new Server(server, {
  cors: { 
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }
});

// Apply JWT authentication middleware to Socket.io
io.use(socketAuth);

initSocketHandlers(io); // attach socket handlers in modular file

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
