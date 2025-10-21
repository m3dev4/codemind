import type { NextFunction, Request, Response } from "express";

const asyncHandlerMiddleware = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => {
  (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch((error: Error) => {
      res.status(500).json({
        message: error.message,
        stack: process.env.NODE_ENV === "production" ? null : error.stack,
      });
    });
  };
};

export default asyncHandlerMiddleware;
