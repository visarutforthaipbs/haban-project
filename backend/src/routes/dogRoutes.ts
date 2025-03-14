import { Router } from "express";
import multer from "multer";
import {
  createDog,
  getDogs,
  getDog,
  updateDog,
  deleteDog,
  searchDogs,
  updateDogStatus,
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

export default router;
