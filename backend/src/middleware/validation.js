const { body, query, param, validationResult } = require("express-validator");

// Helper for handling validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validate dog creation request
const validateCreateDog = [
  body("type")
    .isIn(["lost", "found"])
    .withMessage("Type must be lost or found"),
  body("breed").notEmpty().withMessage("Breed is required"),
  body("color").notEmpty().withMessage("Color is required"),
  body("description").notEmpty().withMessage("Description is required"),
  body("locationName").notEmpty().withMessage("Location name is required"),
  body("location").custom((value) => {
    // Check if location is provided
    if (!value) throw new Error("Location is required");

    // If it's a string (from form data), try to parse it
    let locationObj = value;
    if (typeof value === "string") {
      try {
        locationObj = JSON.parse(value);
      } catch (error) {
        throw new Error("Invalid location format");
      }
    }

    // Check if location has the correct structure
    if (
      !locationObj.type ||
      !locationObj.coordinates ||
      !Array.isArray(locationObj.coordinates) ||
      locationObj.coordinates.length !== 2
    ) {
      throw new Error("Invalid location format");
    }

    return true;
  }),
  handleValidationErrors,
];

// Validate dog update request
const validateUpdateDog = [
  param("id").isMongoId().withMessage("Invalid dog ID"),
  body("breed")
    .optional()
    .notEmpty()
    .withMessage("Breed cannot be empty if provided"),
  body("color")
    .optional()
    .notEmpty()
    .withMessage("Color cannot be empty if provided"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description cannot be empty if provided"),
  body("locationName")
    .optional()
    .notEmpty()
    .withMessage("Location name cannot be empty if provided"),
  body("location")
    .optional()
    .custom((value) => {
      // If it's a string (from form data), try to parse it
      let locationObj = value;
      if (typeof value === "string") {
        try {
          locationObj = JSON.parse(value);
        } catch (error) {
          throw new Error("Invalid location format");
        }
      }

      // Check if location has the correct structure
      if (
        !locationObj.type ||
        !locationObj.coordinates ||
        !Array.isArray(locationObj.coordinates) ||
        locationObj.coordinates.length !== 2
      ) {
        throw new Error("Invalid location format");
      }

      return true;
    }),
  handleValidationErrors,
];

// Validate get dogs query
const validateGetDogs = [
  query("type")
    .optional()
    .isIn(["lost", "found"])
    .withMessage("Type must be lost or found"),
  query("status")
    .optional()
    .isIn(["active", "resolved", "expired"])
    .withMessage("Invalid status"),
  query("lat").optional().isFloat().withMessage("Latitude must be a number"),
  query("lng").optional().isFloat().withMessage("Longitude must be a number"),
  query("radius")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Radius must be a positive number"),
  handleValidationErrors,
];

// Validate search dogs query
const validateSearchDogs = [
  query("q")
    .optional()
    .notEmpty()
    .withMessage("Search query cannot be empty if provided"),
  query("type")
    .optional()
    .isIn(["lost", "found"])
    .withMessage("Type must be lost or found"),
  query("status")
    .optional()
    .isIn(["active", "resolved", "expired"])
    .withMessage("Invalid status"),
  handleValidationErrors,
];

// Validate dog ID parameter
const validateDogId = [
  param("id").isMongoId().withMessage("Invalid dog ID"),
  handleValidationErrors,
];

// Validate status update
const validateUpdateStatus = [
  param("id").isMongoId().withMessage("Invalid dog ID"),
  body("status")
    .isIn(["active", "resolved", "expired"])
    .withMessage("Status must be active, resolved, or expired"),
  handleValidationErrors,
];

module.exports = {
  validateCreateDog,
  validateUpdateDog,
  validateGetDogs,
  validateSearchDogs,
  validateDogId,
  validateUpdateStatus,
  handleValidationErrors,
};
