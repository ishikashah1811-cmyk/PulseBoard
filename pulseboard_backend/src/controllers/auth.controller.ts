import type { Request, Response } from "express";
import User from "../models/User.model.ts";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getGoogleUser } from "../services/googleOAuth.service.ts";
import { getCoreMembershipByEmail } from "../config/coreMembers";

/* -------------------- TOKEN HELPER -------------------- */
const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};

/* -------------------- CORE MEMBERSHIP SYNC -------------------- */
const syncCoreMembership = async (user: any) => {
  const coreMembership = getCoreMembershipByEmail(user.email);

  if (coreMembership) {
    if (
      !user.isCoreMember ||
      user.coreMembership?.clubId !== coreMembership.clubId
    ) {
      user.isCoreMember = true;
      user.coreMembership = {
        clubId: coreMembership.clubId,
        clubName: coreMembership.clubName,
        clubColor: coreMembership.clubColor,
        clubIcon: coreMembership.clubIcon,
        role: coreMembership.role,
      };
      await user.save();
    }
  } else {
    if (user.isCoreMember) {
      user.isCoreMember = false;
      user.coreMembership = undefined;
      await user.save();
    }
  }
};

/* ======================================================
   LOCAL REGISTRATION
====================================================== */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      provider: "local",
      following: [],
    });

    return res.status(201).json({ message: "User created" });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   LOCAL LOGIN
====================================================== */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Google users cannot login with password
    if (user.provider === "google") {
      return res.status(400).json({
        message: "Please use Sign in with Google"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Sync core membership
    await syncCoreMembership(user);

    const token = generateToken(user._id.toString());

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        following: user.following,
        isCoreMember: user.isCoreMember,
        coreMembership: user.coreMembership,
      },
      message: "Login successful",
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GOOGLE OAUTH CALLBACK
====================================================== */
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Authorization code missing" });
    }

    const googleUser = await getGoogleUser(code);

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.sub,
        provider: "google",
        following: [],
      });
    }

    // ✅ Sync core membership
    await syncCoreMembership(user);

    const token = generateToken(user._id.toString());

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        following: user.following,
        isCoreMember: user.isCoreMember,
        coreMembership: user.coreMembership,
      },
    });

  } catch (error) {
    console.error("Google OAuth Error:", error);
    res.status(500).json({ message: "OAuth failed" });
  }
};
