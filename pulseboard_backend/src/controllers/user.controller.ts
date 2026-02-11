import type { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User.model';
import { getCoreMembershipByEmail } from '../config/coreMembers';

/* -------------------- Gravatar Helper -------------------- */
const getGravatarUrl = (email: string) => {
  if (!email) {
    return 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
  }

  const hash = crypto
    .createHash('md5')
    .update(email.trim().toLowerCase())
    .digest('hex');

  return `https://www.gravatar.com/avatar/${hash}?s=200&d=mp`;
};

/* -------------------- Controller -------------------- */
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    // 🔐 From auth middleware (JWT payload)
    const jwtPayload = (req as any).user;
    const userId = jwtPayload?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    /* ---------- Core Membership Sync ---------- */
    const coreMembership = getCoreMembershipByEmail(user.email);

    if (coreMembership) {
      // Update only if needed
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
      // Remove core membership if email no longer exists
      if (user.isCoreMember) {
        user.isCoreMember = false;
        user.coreMembership = undefined;
        await user.save();
      }
    }

    /* ---------- Avatar Logic ---------- */
    const finalAvatar = user.avatar
      ? user.avatar
      : getGravatarUrl(user.email || '');

    /* ---------- Response ---------- */
    return res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      year: user.year,
      branch: user.branch,
      avatar: finalAvatar,
      following: user.following || [],
      isCoreMember: user.isCoreMember,
      coreMembership: user.coreMembership,
    });

  } catch (error) {
    console.error('Profile Fetch Error:', error);
    return res.status(500).json({ message: 'Server Error' });
  }
};
