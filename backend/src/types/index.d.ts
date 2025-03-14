import { Request, Response, NextFunction } from "express";
import { Multer } from "multer";

// Helper type for Express route handlers
export type RouteHandler = (
  req: Request,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;

// Helper type for AuthenticatedRequest route handlers
export type AuthRouteHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next?: NextFunction
) => void | Promise<void>;

// Define the AuthenticatedRequest interface
export interface AuthenticatedRequest extends Request {
  user: any;
  file?: Express.Multer.File;
  files?:
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | Express.Multer.File[];
}
