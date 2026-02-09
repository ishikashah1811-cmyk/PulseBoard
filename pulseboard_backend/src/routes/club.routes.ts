import { Router } from "express";
import { createClub, toggleFollowClub, getAllClubs } from "../controllers/club.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticate, createClub);
router.post("/follow/:clubId", authenticate, toggleFollowClub);
router.get("/", getAllClubs);

export default router;
