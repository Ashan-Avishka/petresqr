import { Request, Response, NextFunction } from 'express';
import { createLogger, format, transports } from 'winston';

const auditLogger = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new transports.File({ filename: 'logs/admin-audit.log' }),
  ],
});

export const adminAudit = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;
  const entry: Record<string, any> = {
    adminId: user?._id?.toString() ?? 'unknown',
    adminEmail: user?.email ?? 'unknown',
    method: req.method,
    path: req.path,
    ip: req.ip ?? req.socket?.remoteAddress ?? 'unknown',
    resourceId: req.params.id ?? null,
  };

  if (['PUT', 'POST', 'DELETE'].includes(req.method)) {
    entry.body = req.body;
  }

  auditLogger.info('Admin action', entry);
  next();
};
