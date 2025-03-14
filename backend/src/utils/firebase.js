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

// Flag to track if Firebase is properly configured
let isFirebaseConfigured = false;

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
    isFirebaseConfigured = true;
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error);
  }
} else {
  console.warn(
    "Missing Firebase configuration. File uploads will be disabled."
  );
}

// Only get storage and bucket if Firebase is configured
const storage =
  isFirebaseConfigured && admin.apps.length ? admin.storage() : null;
const bucket = storage?.bucket();

/**
 * Upload a file to Firebase Storage
 * @param {Object} file - The file to upload (from multer)
 * @returns {Promise<string>} - The public URL of the uploaded file or a placeholder URL
 */
const uploadToFirebase = async (file) => {
  if (!bucket) {
    console.warn(
      "Firebase Storage not configured. Returning placeholder URL for file:",
      file.originalname
    );
    // Return a placeholder URL since Firebase is not configured
    return `https://via.placeholder.com/300?text=Image+Unavailable`;
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
    // Return a placeholder URL if there's an error
    return `https://via.placeholder.com/300?text=Upload+Error`;
  }
};

module.exports = {
  admin,
  storage,
  bucket,
  uploadToFirebase,
  isFirebaseConfigured,
};
