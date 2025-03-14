import { Express } from "express-serve-static-core";
import { Multer } from "multer";

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
      file?: Express.Multer.File;
      files?:
        | {
            [fieldname: string]: Express.Multer.File[];
          }
        | Express.Multer.File[];
    }
  }
}

// Extend the AuthenticatedRequest interface
interface AuthenticatedRequest extends Express.Request {
  user: any;
  file?: Express.Multer.File;
  files?:
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | Express.Multer.File[];
}

export { AuthenticatedRequest };
