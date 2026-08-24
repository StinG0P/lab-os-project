import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);
  res.status(500).json({
    error: true,
    message: "Internal Server Error",
    details: err instanceof Error ? err.message : String(err),
  });
};
