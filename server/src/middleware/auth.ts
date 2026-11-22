import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'replace_with_a_strong_64_char_random_hex_secret') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be configured in production.');
    }
    return 'narmis_dev_fallback_jwt_secret_do_not_use_in_prod_98a7bc65';
  }
  return secret;
};

export const signAuthToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '7d' });
};

export const verifyAuthToken = (token: string): { sub: string } => {
  return jwt.verify(token, getJwtSecret()) as { sub: string };
};

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.slice(7).trim();
  try {
    const decoded = verifyAuthToken(token);
    req.userId = decoded.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication session. Please log in again.' });
  }
};

export const optionalAuth = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    try {
      const decoded = verifyAuthToken(token);
      req.userId = decoded.sub;
    } catch {
      // ignore invalid optional token
    }
  }
  next();
};
