import { Request, Response, NextFunction } from "express";
import { body, query, param, validationResult } from "express-validator";

export const validateCreateDog = [
  body("type").isIn(["lost", "found"]).withMessage("Invalid dog type"),
  body("breed").notEmpty().withMessage("Breed is required"),
  body("color").notEmpty().withMessage("Color is required"),
  body("location")
    .custom((value) => {
      try {
        const location = typeof value === "string" ? JSON.parse(value) : value;
        return (
          location.type === "Point" &&
          Array.isArray(location.coordinates) &&
          location.coordinates.length === 2 &&
          !isNaN(location.coordinates[0]) &&
          !isNaN(location.coordinates[1])
        );
      } catch (error) {
        return false;
      }
    })
    .withMessage("Invalid location format"),
  body("locationName").notEmpty().withMessage("Location name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("contact")
    .if(body("userId").not().exists())
    .notEmpty()
    .withMessage("Contact information is required for guest posts"),
  handleValidationErrors,
];

export const validateUpdateDog = [
  param("id").isMongoId().withMessage("Invalid dog ID"),
  body("type")
    .optional()
    .isIn(["lost", "found"])
    .withMessage("Invalid dog type"),
  body("breed").optional().notEmpty().withMessage("Breed cannot be empty"),
  body("color").optional().notEmpty().withMessage("Color cannot be empty"),
  body("location.type")
    .optional()
    .equals("Point")
    .withMessage("Invalid location type"),
  body("location.coordinates")
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage("Invalid coordinates format"),
  body("location.coordinates.*")
    .optional()
    .isFloat()
    .withMessage("Coordinates must be numbers"),
  body("locationName")
    .optional()
    .notEmpty()
    .withMessage("Location name cannot be empty"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description cannot be empty"),
  handleValidationErrors,
];

export const validateGetDogs = [
  query("type")
    .optional()
    .isIn(["lost", "found"])
    .withMessage("Invalid dog type"),
  query("status")
    .optional()
    .isIn(["active", "resolved", "expired"])
    .withMessage("Invalid status"),
  query("lat")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  query("lng")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
  query("radius")
    .optional()
    .isInt({ min: 1, max: 50000 })
    .withMessage("Radius must be between 1 and 50000 meters"),
  query("userId").optional().isString().withMessage("Invalid user ID"),
  handleValidationErrors,
];

export const validateSearchDogs = [
  query("q").optional().isString().withMessage("Invalid search query"),
  query("type")
    .optional()
    .isIn(["lost", "found"])
    .withMessage("Invalid dog type"),
  query("status")
    .optional()
    .isIn(["active", "resolved", "expired"])
    .withMessage("Invalid status"),
  handleValidationErrors,
];

export const validateDogId = [
  param("id").isMongoId().withMessage("Invalid dog ID"),
  handleValidationErrors,
];

export const validateUpdateStatus = [
  param("id").isMongoId().withMessage("Invalid dog ID"),
  body("status")
    .isIn(["active", "resolved", "expired"])
    .withMessage("Invalid status"),
  handleValidationErrors,
];

export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
}
