import express, { Router } from "express";
import multer from "multer";
import {
  createDog,
  getDogs,
  getDog,
  updateDog,
  deleteDog,
  searchDogs,
  updateDogStatus,
  saveDog,
  unsaveDog,
  getSavedDogs,
} from "../controllers/dogController";
import {
  validateCreateDog,
  validateUpdateDog,
  validateGetDogs,
  validateSearchDogs,
  validateDogId,
  validateUpdateStatus,
} from "../middleware/validation";
import { optionalAuth, verifyToken } from "../middleware/auth";

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

// Public routes
router.get("/", optionalAuth, validateGetDogs, getDogs);
router.get("/search", validateSearchDogs, searchDogs);

// Get all saved dogs - IMPORTANT: This must come BEFORE the /:id route
router.get("/saved", verifyToken, getSavedDogs);

router.get("/:id", validateDogId, getDog);

// Protected routes
router.post(
  "/",
  optionalAuth,
  upload.array("photos", 5),
  validateCreateDog,
  createDog
);
router.patch(
  "/:id",
  verifyToken,
  upload.array("photos", 5),
  validateUpdateDog,
  updateDog
);
router.delete("/:id", verifyToken, validateDogId, deleteDog);
router.patch("/:id/status", verifyToken, validateUpdateStatus, updateDogStatus);

// Save a dog
router.post("/:id/save", verifyToken, saveDog);

// Unsave a dog
router.delete("/:id/save", verifyToken, unsaveDog);

export default router;
