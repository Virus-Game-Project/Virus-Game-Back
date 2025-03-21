const { connection } = require("./database/connection");
const express = require("express");
const cors = require("cors");
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
dotenv.config();

console.log("Virus game backend api started");

connection(process.env.MONGO_URI);

const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());

const UserRoutes = require("./routes/UserRoutes");
app.use("/api/users", UserRoutes);
const RoomRoutes = require("./routes/RoomRoutes");
app.use("/api/rooms", RoomRoutes);

app.get("/test-route", (_req, res) => {
    return res.status(200).json({
        "version": "1.2.2"
    });
});

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: ['https://virus-card-game.web.app', 'http://localhost:4200'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
});

const requests = require('./socket-requests/requests');
requests(io);

server.listen(port, () => {
    console.log("Node server running in port:", port); 
});