const admin = require("firebase-admin");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

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

const storage = admin.apps.length ? admin.storage() : null;
const bucket = storage?.bucket();

/**
 * Upload a file to Firebase Storage
 * @param {Object} file - The file to upload (from multer)
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
const uploadToFirebase = async (file) => {
  if (!bucket) {
    throw new Error("Firebase Storage is not configured");
  }

  try {
    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.originalname.replace(/\s+/g, "-")}`;
    const fileUpload = bucket.file(filename);

    // Create a write stream and upload the file
    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    // Return a promise that resolves with the public URL when the upload is complete
    return new Promise((resolve, reject) => {
      blobStream.on("error", (error) => {
        reject(error);
      });

      blobStream.on("finish", async () => {
        // Make the file public
        await fileUpload.makePublic();

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  } catch (error) {
    console.error("Error uploading to Firebase:", error);
    throw error;
  }
};

module.exports = {
  admin,
  storage,
  bucket,
  uploadToFirebase,
};
