import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import globalErrorHandler from "./utils/globalHandler";
import userRoutes from "./users/userRoutes";
import adminRoutes from "./admin/adminRoutes";
import subordinateRoutes from "./subordinates/subordinateRoutes";
import { checkUser, verifyApiKey } from "./utils/middleware";
import { Server } from "socket.io";
import socketController from "./socket/socket";
import playerRoutes from "./players/playerRoutes";
import transactionRoutes from "./transactions/transactionRoutes";
import storeRoutes from "./store/storeRoutes";
import betRoutes from "./bets/betRoutes"
import { createClient } from "redis";
import { promisify } from "util";
import { Redis } from "ioredis";



const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

const server = createServer(app);

// // Initialize Redis client
// const redisClient = new Redis({
//   port: 6379, // Redis server port
//   host: 'localhost' // Redis server host
// });redisClient.on("error", (err) => console.error("Redis Client Error", err));
// redisClient.set('key', 'value')
//   .then(() => redisClient.get('key'))
//   .then(result => {
//     console.log(result); // Should output 'value'
//   })
//   .catch(err => {
//     console.error('Redis error:', err);
//   });

app.use("/api/auth", userRoutes);
app.use("/api/players", checkUser, playerRoutes);
app.use("/api/admin", verifyApiKey, adminRoutes);
app.use("/api/subordinates", checkUser, subordinateRoutes);
app.use("/api/store", checkUser, storeRoutes);
app.use("/api/transactions", checkUser, transactionRoutes);
app.use("/api/bets", checkUser, betRoutes);



app.get("/", (req, res, next) => {
  const health = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: new Date().toLocaleDateString(),
  };
  // redisClient.lpush("submissions", JSON.stringify({ health }))
  res.status(200).json(health);
});

app.use(express.static("src"));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
socketController(io);

app.use(globalErrorHandler);

export { io }
export default server;
