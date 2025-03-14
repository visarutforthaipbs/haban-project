import { Router } from "express";
import multer from "multer";
import { updateProfile } from "../controllers/userController";
import { verifyToken } from "../middleware/auth";
import { body } from "express-validator";
import { handleValidationErrors } from "../middleware/validation";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

// Validate profile update
const validateProfileUpdate = [
  body("name").notEmpty().withMessage("Name is required"),
  body("bio").optional().isString().withMessage("Bio must be a string"),
  body("preferredContact")
    .optional()
    .isString()
    .withMessage("Preferred contact must be a string"),
  handleValidationErrors,
];

// Protected route for updating user profile
router.patch(
  "/profile",
  verifyToken,
  upload.single("profileImage"),
  validateProfileUpdate,
  updateProfile
);

export default router;
