import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
const app = express();
import http from "http";


import { Server as SocketIOServer } from 'socket.io';
import { handleSocketConnection } from './controllers/chat.controller.js';
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Allow all origins for simplicity. Adjust for production.
  },
});

handleSocketConnection(io);


app.use(
  cors(),
  //   {
  //   origin: process.env.CORS_ORIGIN,
  //   credentials: true,
  // }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(
  session({
    secret: process.env.ACCESS_TOKEN_SECRET, // Replace with your secret key
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());

import userRouter from "./routes/user.routes.js";
import storageRouter from "./routes/storage.routes.js";
import homeRouter from "./routes/home.routes.js";
import chatRouter from "./routes/chat.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/storage", storageRouter);
app.use("/api/v1/home", homeRouter);
app.use("/api/v1/chat", chatRouter);

export { app,server };
