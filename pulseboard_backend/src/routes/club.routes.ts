import { Router } from "express";

import { authenticate } from '../middlewares/auth.middleware.ts';
import { createClub , getClubById , toggleFollowClub, getAllClubs } from "../controllers/club.controller.ts";


const router = Router();
router.get("/", getAllClubs);     // 👈 ADD THIS
router.get("/:id", getClubById);
router.post("/", createClub);

// FIX: Use 'authenticate' variable here
router.post('/follow/:clubId', authenticate, toggleFollowClub);

export default router;