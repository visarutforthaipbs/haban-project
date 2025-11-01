import * as express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import path from "path";

// Load environment variables first
dotenv.config();

// Fix SSL certificate issues on Mac for Firebase Admin SDK
// This MUST be set before importing firebase module
// Remove the production check - always disable for Mac to avoid SSL issues
if (process.platform === "darwin") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.log("⚠️  SSL certificate verification disabled for Mac deployment");
}

import "./utils/firebase"; // Initialize Firebase Admin SDK
import dogRoutes from "./routes/dogRoutes";
import authRoutes from "./routes/authRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import userRoutes from "./routes/userRoutes";
import previewRoutes from "./routes/previewRoutes";
import { socialMediaPrerender } from "./middleware";

// Create Express app
const app = express.default();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Social media prerender middleware (for API routes)
app.use(socialMediaPrerender);

// Social media preview direct routes (for frontend routes)
app.use("/preview", previewRoutes);

// Database connection
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/lost-found-dogs"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });

  // Join room for specific dog updates
  socket.on("join-dog", (dogId: string) => {
    socket.join(`dog:${dogId}`);
  });

  // Leave room
  socket.on("leave-dog", (dogId: string) => {
    socket.leave(`dog:${dogId}`);
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dogs", dogRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// Add a direct route for social media crawlers
app.get("/dogs/:id", async (req, res, next) => {
  const userAgent = req.get("user-agent") || "";
  const isSocialMediaBot = [
    "facebookexternalhit",
    "Facebot",
    "LinkedInBot",
    "Twitterbot",
    "WhatsApp",
    "Line",
  ].some((bot) => userAgent.toLowerCase().includes(bot.toLowerCase()));

  if (isSocialMediaBot) {
    console.log(`Social bot detected at /dogs/:id: ${userAgent}`);
    try {
      const dogId = req.params.id;
      const dog = await dogService.getDogById(dogId);

      if (!dog) {
        return next();
      }

      const title = dog.name
        ? `${dog.name} - ${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${
            dog.breed
          }`
        : `${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${dog.breed}`;

      const description =
        dog.description ||
        `${dog.type === "lost" ? "สุนัขหาย" : "พบสุนัข"} ${dog.breed} จาก ${
          dog.locationName
        }`;

      const imageUrl =
        dog.photos && dog.photos.length > 0
          ? dog.photos[0].startsWith("http")
            ? dog.photos[0]
            : `${req.protocol}://${req.get("host")}${dog.photos[0]}`
          : `${req.protocol}://${req.get("host")}/default-dog.jpg`;

      const canonicalUrl = `https://www.haban.love/dogs/${dog._id}`;

      console.log(`Generating social preview for dog ID: ${dogId}`);
      console.log(`Image URL: ${imageUrl}`);

      const html = `
        <!DOCTYPE html>
        <html lang="th">
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <meta name="description" content="${description}">
          
          <!-- Open Graph / Facebook -->
          <meta property="og:type" content="website">
          <meta property="og:url" content="${canonicalUrl}">
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:image" content="${imageUrl}">
          <meta property="og:image:width" content="1200">
          <meta property="og:image:height" content="630">
          <meta property="og:locale" content="th_TH">
          <meta property="og:site_name" content="haban.love - ระบบแจ้งและตามหาสุนัขหาย">
          <meta property="fb:app_id" content="297302183484420">
          
          <!-- Twitter -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:url" content="${canonicalUrl}">
          <meta name="twitter:title" content="${title}">
          <meta name="twitter:description" content="${description}">
          <meta name="twitter:image" content="${imageUrl}">
          
          <!-- Canonical -->
          <link rel="canonical" href="${canonicalUrl}">
          
          <!-- Redirect to the actual page -->
          <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
        </head>
        <body>
          <p>กำลังนำคุณไปที่ <a href="${canonicalUrl}">${title}</a></p>
        </body>
        </html>
      `;

      return res.send(html);
    } catch (error) {
      console.error("Error generating social preview:", error);
      return next();
    }
  } else {
    // Not a social media bot, continue
    next();
  }
});

// Basic health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      message: "Something went wrong!",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
