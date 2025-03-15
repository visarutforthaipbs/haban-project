import { Express } from "express-serve-static-core";
import { Multer } from "multer";
import * as expressOriginal from "express";

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
      originalUrl: string;
      protocol: string;
      get(name: string): string | undefined;
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

// Extend the express module
declare module "express" {
  export interface Request {
    originalUrl: string;
    protocol: string;
    get(name: string): string | undefined;
  }

  export interface Response {
    status(code: number): Response;
    json(body: any): Response;
    send(body: any): Response;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export function json(): expressOriginal.RequestHandler;
  export function urlencoded(options: {
    extended: boolean;
  }): expressOriginal.RequestHandler;
  export function static(
    root: string,
    options?: any
  ): expressOriginal.RequestHandler;
}

export {};
