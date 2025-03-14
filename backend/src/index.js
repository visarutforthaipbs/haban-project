/**
 * This is a JavaScript fallback version of index.ts to help with deployment issues
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

// Import routes
const dogRoutes = require("./routes/dogRoutes");
const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes = require("./routes/userRoutes");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "https://haban-project.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "https://haban-project.vercel.app",
      ];

      // Allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        console.log("Blocked by CORS: ", origin);
        return callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Database connection
console.log("Attempting to connect to MongoDB...");
console.log(
  "MongoDB URI:",
  process.env.MONGODB_URI ? "URI is set" : "URI is not set, using default"
);

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/lost-found-dogs",
    {
      // Connection options
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    }
  )
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((error) => {
    console.error("MongoDB connection error details:", error);
    console.error("Error stack:", error.stack);
  });

// Socket.io handlers
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinRoom", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on("leaveRoom", (userId) => {
    socket.leave(userId);
    console.log(`User ${userId} left their room`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Attach socket.io to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dogs", dogRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("ERROR DETAILS:");
  console.error(`Path: ${req.path}`);
  console.error(`Query: ${JSON.stringify(req.query)}`);
  console.error(`Method: ${req.method}`);
  console.error(`Headers: ${JSON.stringify(req.headers)}`);
  console.error(`Error: ${err.message}`);
  console.error(`Stack: ${err.stack}`);

  res.status(500).json({
    message: "Something went wrong!",
    error:
      process.env.NODE_ENV === "development" ? err.message : "Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
