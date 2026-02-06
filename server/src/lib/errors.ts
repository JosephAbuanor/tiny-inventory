import type { Response } from "express";
import type { ErrorResponse } from "../types/api.js";

export function sendError(
  res: Response,
  status: number,
  message: string,
  details?: unknown
): void {
  const body: ErrorResponse = {
    error: details !== undefined ? { message, details } : { message },
  };
  res.status(status).json(body);
}

/** Type guard for "record not found" (P2025). */
export function NotFoundError(e: unknown): e is { code: string } {
  return (
    e != null &&
    typeof e === "object" &&
    "code" in e &&
    (e as { code: string }).code === "P2025"
  );
}
