import type { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include voterIp
declare global {
  namespace Express {
    interface Request {
      voterIp?: string;
    }
  }
}

export const ipTracker = (req: Request, res: Response, next: NextFunction) => {
  // Extract real IP from headers or socket
  const forwarded = req.headers['x-forwarded-for'];
  let ip: string;
  
  if (forwarded) {
    const forwardedIp = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    ip = forwardedIp || 'unknown';
  } else {
    ip = req.socket.remoteAddress || 'unknown';
  }
  
  req.voterIp = ip.trim();
  next();
};
