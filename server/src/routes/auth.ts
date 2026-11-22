import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { User } from '../models/User';
import { CollegeVerification } from '../models/CollegeVerification';
import { TermsAcceptance } from '../models/TermsAcceptance';
import { uploadImageToCloudinary } from '../config/cloudinary';
import {
  AuthenticatedRequest,
  requireAuth,
  signAuthToken,
} from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';

const router = Router();

const DEFAULT_CAMPUS_LOCATION = 'Chitkara University, Rajpura, Punjab, India';
const DEFAULT_COLLEGE_NAME = 'Chitkara University';

const formatOwnerProfileResponse = async (userId: string) => {
  const userDoc = await User.findById(userId);
  if (!userDoc) return null;

  const verif = await CollegeVerification.findOne({ user_id: userDoc._id });

  const json = userDoc.toJSON() as Record<string, any>;
  json.joined_date = new Date(userDoc.created_at).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  if (verif) {
    json.college_name = verif.college_name || json.college_name;
    json.college_verification_status = verif.verification_status;
    json.college_id_number = verif.college_id_number;
    json.college_submitted_at = verif.submitted_at
      ? verif.submitted_at.toISOString()
      : undefined;
    json.college_verified_at = verif.reviewed_at
      ? verif.reviewed_at.toISOString()
      : undefined;
  }

  return json;
};

// POST /api/auth/register
router.post('/register', authRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      fullName,
      email,
      password,
      collegeName,
      collegeIdNumber,
      collegeIdImageDataUrl,
      avatarDataUrl,
      location,
    } = req.body || {};

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      res.status(400).json({ error: 'Full name is required.' });
      return;
    }
    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'A valid email address is required.' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: trimmedEmail });
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const cleanName = fullName.trim();
    const cleanCollege =
      typeof collegeName === 'string' && collegeName.trim()
        ? collegeName.trim()
        : DEFAULT_COLLEGE_NAME;
    const cleanLocation =
      typeof location === 'string' && location.trim()
        ? location.trim()
        : DEFAULT_CAMPUS_LOCATION;
    const cleanCollegeId =
      typeof collegeIdNumber === 'string' ? collegeIdNumber.trim() : '';

    const password_hash = await bcrypt.hash(password, 12);

    const hasUploadedIdImage = Boolean(
      typeof collegeIdImageDataUrl === 'string' && collegeIdImageDataUrl.trim()
    );
    // Uploading an ID marks status as Pending Verification; never automatically Verified!
    const initialVerificationStatus = hasUploadedIdImage
      ? 'Pending Verification'
      : 'Not Submitted';

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      cleanName
    )}&background=304943&color=EAD3AA&bold=true&size=150`;

    const newUser = await User.create({
      full_name: cleanName,
      email: trimmedEmail,
      password_hash,
      avatar_url: defaultAvatar,
      bio: 'Member of NARMIS circular community.',
      location: cleanLocation,
      college_name: cleanCollege,
      college_verification_status: initialVerificationStatus,
      rating: 5.0,
      review_count: 0,
      email_verified: true,
    });

    const userIdStr = String(newUser._id);

    // Optional avatar upload to Cloudinary
    if (typeof avatarDataUrl === 'string' && avatarDataUrl.trim()) {
      try {
        const uploadedAvatar = await uploadImageToCloudinary(avatarDataUrl, userIdStr, 'avatar');
        newUser.avatar_url = uploadedAvatar.url;
        await newUser.save();
      } catch (err) {
        console.warn('Avatar upload fallback during registration:', err);
      }
    }

    // Optional private College ID upload & verification record
    if (cleanCollegeId || hasUploadedIdImage) {
      let privateUrl: string | undefined;
      let publicId: string | undefined;
      if (hasUploadedIdImage) {
        const uploadedId = await uploadImageToCloudinary(
          collegeIdImageDataUrl,
          userIdStr,
          'college-id'
        );
        privateUrl = uploadedId.url;
        publicId = uploadedId.public_id;
      }

      await CollegeVerification.create({
        user_id: newUser._id,
        college_name: cleanCollege,
        college_id_number: cleanCollegeId || 'PENDING_ID_NUMBER',
        college_id_image_url: privateUrl,
        cloudinary_public_id: publicId,
        verification_status: initialVerificationStatus,
        submitted_at: hasUploadedIdImage ? new Date() : undefined,
      });
    }

    await TermsAcceptance.create({
      user_id: newUser._id,
      terms_type: 'account_signup',
      terms_version: 'v1.0',
      ip_address: req.ip,
    });

    const token = signAuthToken(userIdStr);
    const profile = await formatOwnerProfileResponse(userIdStr);

    res.status(201).json({
      token,
      user: profile,
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: err?.message || 'Failed to register user account.' });
  }
});

// POST /api/auth/login
router.post('/login', authRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const userDoc = await User.findOne({ email: trimmedEmail }).select('+password_hash');
    if (!userDoc || !userDoc.password_hash) {
      res.status(401).json({
        error: 'Invalid email or password. Please check your credentials or create an account.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, userDoc.password_hash);
    if (!isMatch) {
      res.status(401).json({
        error: 'Invalid email or password. Please check your credentials or create an account.',
      });
      return;
    }

    const userIdStr = String(userDoc._id);
    const token = signAuthToken(userIdStr);
    const profile = await formatOwnerProfileResponse(userIdStr);

    res.json({
      token,
      user: profile,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed. Please try again.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res: Response) => {
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const profile = await formatOwnerProfileResponse(req.userId!);
    if (!profile) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }
    res.json({ user: profile });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({ error: 'Unable to load user profile.' });
  }
});

// PUT /api/auth/profile
router.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { full_name, bio, location, avatar_url, college_name } = req.body || {};
    const userDoc = await User.findById(req.userId);
    if (!userDoc) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    if (typeof full_name === 'string' && full_name.trim()) {
      userDoc.full_name = full_name.trim().slice(0, 120);
    }
    if (typeof bio === 'string') {
      userDoc.bio = bio.trim().slice(0, 500);
    }
    if (typeof location === 'string' && location.trim()) {
      userDoc.location = location.trim().slice(0, 200);
    }
    if (typeof college_name === 'string' && college_name.trim()) {
      userDoc.college_name = college_name.trim().slice(0, 150);
    }
    if (typeof avatar_url === 'string' && avatar_url.trim()) {
      if (avatar_url.startsWith('data:image/')) {
        const uploaded = await uploadImageToCloudinary(avatar_url, String(userDoc._id), 'avatar');
        userDoc.avatar_url = uploaded.url;
      } else {
        userDoc.avatar_url = avatar_url.trim();
      }
    }

    // Notice: college_verification_status is NEVER modifiable via client profile update
    await userDoc.save();

    const profile = await formatOwnerProfileResponse(String(userDoc._id));
    res.json({ user: profile });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: err?.message || 'Failed to update profile.' });
  }
});

// PUT /api/auth/password
router.put('/password', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(req.userId, { password_hash });

    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to update password.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const userDoc = await User.findOne({ email: trimmedEmail });

    if (userDoc) {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      userDoc.reset_password_token_hash = tokenHash;
      userDoc.reset_password_expires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
      await userDoc.save();
    }

    // Always return uniform response to prevent user enumeration
    res.json({
      success: true,
      message: `If an account exists for ${trimmedEmail}, password recovery instructions have been recorded.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Unable to process password reset request.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authRateLimiter, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({ error: 'Valid reset token and new password (min 6 chars) are required.' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const userDoc = await User.findOne({
      reset_password_token_hash: tokenHash,
      reset_password_expires: { $gt: new Date() },
    });

    if (!userDoc) {
      res.status(400).json({ error: 'Password reset token is invalid or has expired.' });
      return;
    }

    userDoc.password_hash = await bcrypt.hash(newPassword, 12);
    userDoc.reset_password_token_hash = undefined;
    userDoc.reset_password_expires = undefined;
    await userDoc.save();

    res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Unable to reset password.' });
  }
});

// POST /api/auth/college-verification
router.post(
  '/college-verification',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { collegeName, collegeIdNumber, collegeIdImageDataUrl } = req.body || {};
      const userId = req.userId!;

      if (!collegeIdNumber || typeof collegeIdNumber !== 'string' || !collegeIdNumber.trim()) {
        res.status(400).json({ error: 'Please enter your College ID number.' });
        return;
      }

      const cleanCollege =
        typeof collegeName === 'string' && collegeName.trim()
          ? collegeName.trim()
          : DEFAULT_COLLEGE_NAME;
      const cleanIdNum = collegeIdNumber.trim();
      const hasImage = Boolean(
        typeof collegeIdImageDataUrl === 'string' && collegeIdImageDataUrl.trim()
      );

      const existingVerif = await CollegeVerification.findOne({ user_id: userId });

      let privateUrl = existingVerif?.college_id_image_url;
      let publicId = existingVerif?.cloudinary_public_id;

      if (hasImage) {
        const uploaded = await uploadImageToCloudinary(
          collegeIdImageDataUrl,
          userId,
          'college-id'
        );
        privateUrl = uploaded.url;
        publicId = uploaded.public_id;
      }

      // Status becomes Pending Verification when an image is uploaded; never auto-verified!
      const nextStatus =
        hasImage || privateUrl ? 'Pending Verification' : 'Not Submitted';

      await CollegeVerification.findOneAndUpdate(
        { user_id: userId },
        {
          user_id: userId,
          college_name: cleanCollege,
          college_id_number: cleanIdNum,
          college_id_image_url: privateUrl,
          cloudinary_public_id: publicId,
          verification_status: nextStatus,
          submitted_at: hasImage ? new Date() : existingVerif?.submitted_at,
        },
        { upsert: true, new: true }
      );

      await User.findByIdAndUpdate(userId, {
        college_name: cleanCollege,
        college_verification_status: nextStatus,
      });

      const profile = await formatOwnerProfileResponse(userId);
      res.json({ success: true, user: profile });
    } catch (err: any) {
      console.error('College verification submit error:', err);
      res.status(500).json({ error: err?.message || 'Failed to submit college verification.' });
    }
  }
);

export default router;
