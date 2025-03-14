import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { validationResult } from "express-validator";
import axios from "axios";
import User, { IUser } from "../models/User";
import * as admin from "firebase-admin";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

interface FacebookUserInfo {
  id: string;
  email?: string;
  name: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

const generateToken = (user: { id: string; email: string; name: string }) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const options: SignOptions = {
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN || "604800"), // 7 days in seconds
  };

  return jwt.sign(
    { userId: user.id, email: user.email, name: user.name },
    Buffer.from(secret, "utf-8"),
    options
  );
};

export const loginWithFacebook = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    // Verify the access token and get user info from Facebook
    const response = await axios.get<FacebookUserInfo>(
      `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const { id: facebookId, email, name, picture } = response.data;

    // Find or create user
    let user = await User.findOne({
      $or: [{ facebookId }, ...(email ? [{ email }] : [])],
    });

    if (!user) {
      // Create new user
      user = new User({
        facebookId,
        email,
        name,
        profileImage: picture?.data.url,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Generate random password for Facebook users
      });
      await user.save();
    } else if (!user.facebookId) {
      // Link Facebook to existing email account
      user.facebookId = facebookId;
      user.profileImage = picture?.data.url || user.profileImage;
      await user.save();
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    res.json({
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
    res.status(500).json({ message: "Facebook login failed" });
  }
};

export const loginWithFirebase = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Extract user information from the decoded token
    const { uid, email, name, picture } = decodedToken;

    // Ensure we have an email
    if (!email) {
      return res
        .status(400)
        .json({ message: "Email is required for registration" });
    }

    // Find or create user based on Firebase UID or email
    let user = await User.findOne({
      $or: [{ firebaseUid: uid }, { email }],
    });

    let isNewUser = false;

    if (!user) {
      // Create new user
      isNewUser = true;
      user = new User({
        firebaseUid: uid,
        email,
        name: name || email.split("@")[0], // Use name from token or derive from email
        profileImage: picture,
        password: await bcrypt.hash(Math.random().toString(36), 10), // Generate random password
      });
      await user.save();
    } else if (!user.firebaseUid) {
      // Link Firebase UID to existing email account
      user.firebaseUid = uid;
      if (picture) user.profileImage = picture;
      if (name) user.name = name;
      await user.save();
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      sameSite: "lax",
    });

    // Return user info and token
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
      isNewUser,
    });
  } catch (error) {
    console.error("Firebase authentication error:", error);
    return res.status(500).json({ message: "Authentication failed" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      sameSite: "lax",
    });

    res.json({
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
    res.status(500).json({ message: "Server error" });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      email,
      password: hashedPassword,
      name,
    });

    await user.save();

    // Generate token
    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    // Set token as a cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      sameSite: "lax",
    });

    res.status(201).json({
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
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
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
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Clear the token cookie
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
