const { Router } = require("express");
const { body } = require("express-validator");
const {
  login,
  register,
  getCurrentUser,
  logout,
  loginWithFacebook,
  loginWithFirebase,
} = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

const router = Router();

// Validation middleware
const validateLogin = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
];

const validateRegister = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("name").notEmpty().withMessage("Name is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const validateFacebookLogin = [
  body("accessToken")
    .notEmpty()
    .withMessage("Facebook access token is required"),
];

const validateFirebaseLogin = [
  body("idToken").notEmpty().withMessage("Firebase ID token is required"),
];

// Routes
router.post("/login", validateLogin, login);
router.post("/register", validateRegister, register);
router.post("/facebook", validateFacebookLogin, loginWithFacebook);
router.post("/firebase", validateFirebaseLogin, loginWithFirebase);
router.get("/me", verifyToken, getCurrentUser);
router.post("/logout", verifyToken, logout);

module.exports = router;
