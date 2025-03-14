const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const axios = require("axios");
const User = require("../models/User");
const admin = require("firebase-admin");

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options = {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || "604800"), // 7 days in seconds
  };

  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    Buffer.from(secret, "utf-8"),
    options
  );
};

const loginWithFacebook = async (req, res) => {
  try {
    const { accessToken } = req.body;

    // Verify the access token and get user info from Facebook
    const response = await axios.get(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const { id, name, email, picture } = response.data;

    if (!id || !name) {
      return res.status(400).json({ message: "Invalid Facebook data" });
    }

    // Look for an existing user
    let user = await User.findOne({ facebookId: id });

    // If no user found but email exists, try to find by email
    if (!user && email) {
      user = await User.findOne({ email });
    }

    // If user exists, update their info
    if (user) {
      user.facebookId = id;
      user.name = name;
      if (email) user.email = email;
      if (picture && picture.data && picture.data.url) {
        user.profileImage = picture.data.url;
      }
      await user.save();
    } else {
      // Create a new user
      user = await User.create({
        facebookId: id,
        email: email || `fb_${id}@placeholder.com`,
        name,
        profileImage: picture?.data?.url,
        password: await bcrypt.hash(Math.random().toString(36), 10),
      });
    }

    // Generate a JWT token
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Return user info with token
    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        preferredContact: user.preferredContact,
        contactInfo: user.contactInfo,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Facebook login error:", error);
    return res.status(500).json({
      message: "Failed to authenticate with Facebook",
      error: error.message,
    });
  }
};

const loginWithFirebase = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify the ID token with Firebase
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error("Firebase ID token verification failed:", error);
      return res.status(401).json({
        message: "Unauthorized - Invalid Firebase token",
        error: error.message,
      });
    }

    const { uid, email, name, picture } = decodedToken;

    // Look for an existing user by Firebase UID
    let user = await User.findOne({ firebaseUid: uid });

    // If no user found but email exists, try to find by email
    if (!user && email) {
      user = await User.findOne({ email });
    }

    // If user exists, update their info
    if (user) {
      user.firebaseUid = uid;
      if (name) user.name = name;
      if (email) user.email = email;
      if (picture) user.profileImage = picture;
      await user.save();
    } else {
      // Create a new user
      user = await User.create({
        firebaseUid: uid,
        email: email || `firebase_${uid}@placeholder.com`,
        name: name || "Firebase User",
        profileImage: picture,
        password: await bcrypt.hash(Math.random().toString(36), 10),
      });
    }

    // Generate a JWT token
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Return user info with token
    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        preferredContact: user.preferredContact,
        contactInfo: user.contactInfo,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Firebase login error:", error);
    return res.status(500).json({
      message: "Failed to authenticate with Firebase",
      error: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(201).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        preferredContact: user.preferredContact,
        contactInfo: user.contactInfo,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "Failed to register user",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        preferredContact: user.preferredContact,
        contactInfo: user.contactInfo,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res
      .status(500)
      .json({ message: "Failed to login", error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profileImage: user.profileImage,
        bio: user.bio,
        preferredContact: user.preferredContact,
        contactInfo: user.contactInfo,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res
      .status(500)
      .json({ message: "Failed to get user data", error: error.message });
  }
};

const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  return res.status(200).json({ message: "Logout successful" });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
  loginWithFacebook,
  loginWithFirebase,
};
