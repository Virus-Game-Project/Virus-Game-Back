const { connection } = require("./database/connection");
const express = require("express");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();

console.log("Virus game backend api started");

connection(process.env.MONGO_URI);

const app = express();
const port = process.env.PORT;
app.use(cors());
app.use(express.json());

app.get("/test-route", (_req, res) => {
    return res.status(200).json({
        "version": "0.0.0"
    });
});

const server = http.createServer(app);
const io = socketIo(server);

const requests = require('./socket-requests/requests');
requests(io);

server.listen(port, () => {
    console.log("Node server running in port:", port); 
});