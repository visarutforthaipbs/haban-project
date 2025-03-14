import { Express } from "express-serve-static-core";
import { Multer } from "multer";
import "express";

declare global {
  namespace Express {
    interface Multer {
      any(): any;
      array(field: string, maxCount?: number): any;
      fields(fields: any[]): any;
      none(): any;
      single(field: string): any;
    }

    interface Request {
      user?: any;
      file?: any;
      files?: any;
      body?: any;
      query?: any;
      params?: any;
      headers?: any;
      cookies?: any;
    }

    interface Response {
      status(code: number): Response;
      json(body?: any): Response;
      send(body?: any): Response;
      cookie(name: string, val: string, options?: any): Response;
      clearCookie(name: string, options?: any): Response;
      redirect(url: string): Response;
      render(view: string, locals?: any): Response;
    }
  }
}

// Define AuthenticatedRequest interface with all the properties
export interface AuthenticatedRequest extends Express.Request {
  user: any;
  file?: any;
  files?: any;
  body?: any;
  query?: any;
  params?: any;
  headers?: any;
  cookies?: any;
}
