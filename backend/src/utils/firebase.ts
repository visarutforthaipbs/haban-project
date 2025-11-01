import * as admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Fix SSL certificate issues on Mac for Firebase Admin SDK
// This MUST be set BEFORE any Firebase initialization
if (process.platform === "darwin") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.log("⚠️  SSL certificate verification disabled for Mac deployment");
}

// Debug logging for Firebase configuration
console.log("Checking Firebase configuration:");
console.log("Project ID:", process.env.FIREBASE_PROJECT_ID ? "✓" : "✗");
console.log("Private Key:", process.env.FIREBASE_PRIVATE_KEY ? "✓" : "✗");
console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL ? "✓" : "✗");
console.log("Storage Bucket:", process.env.FIREBASE_STORAGE_BUCKET ? "✓" : "✗");

// Initialize Firebase Admin only if all required environment variables are present
if (
  !admin.apps.length &&
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_STORAGE_BUCKET
) {
  try {
    const firebaseConfig = {
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    };

    console.log("Initializing Firebase with config:", {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });

    admin.initializeApp(firebaseConfig);
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
} else {
  console.error("Missing required Firebase configuration variables");
}

export const storage = admin.apps.length ? admin.storage() : null;
export const bucket = storage?.bucket();

export const uploadToFirebase = async (
  file: Express.Multer.File
): Promise<string> => {
  if (!storage || !bucket) {
    console.error("Firebase Storage is not initialized");
    throw new Error(
      "Firebase Storage is not initialized. Please check your environment variables."
    );
  }

  if (!file.buffer || file.buffer.length === 0) {
    console.error("Invalid file buffer");
    throw new Error("Invalid file: Empty file buffer");
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const fileName = `${uniqueSuffix}-${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  console.log(`Starting upload for file: ${fileName}`);

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
    resumable: false, // Disable resumable uploads for smaller files
  });

  return new Promise((resolve, reject) => {
    blobStream.on("error", (error) => {
      console.error(`Error uploading file ${fileName}:`, error);
      reject(new Error(`Failed to upload file: ${error.message}`));
    });

    blobStream.on("finish", async () => {
      try {
        // Make the file public
        await fileUpload.makePublic();
        console.log(`File ${fileName} uploaded successfully`);

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      } catch (error) {
        console.error(`Error making file ${fileName} public:`, error);
        reject(new Error("Failed to make file public"));
      }
    });

    blobStream.end(file.buffer);
  });
};
