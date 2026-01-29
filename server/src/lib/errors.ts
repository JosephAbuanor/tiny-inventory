import type { Response } from "express";

export function sendError(
  res: Response,
  status: number,
  message: string,
  details?: unknown
): void {
  res.status(status).json({
    error: details !== undefined ? { message, details } : { message },
  });
}
