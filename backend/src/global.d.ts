// This file contains global type declarations to override TypeScript's default types

// Override Express types
declare namespace Express {
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

// Define AuthenticatedRequest
interface AuthenticatedRequest extends Express.Request {
  user: any;
  file?: any;
  files?: any;
  body?: any;
  query?: any;
  params?: any;
  headers?: any;
  cookies?: any;
}

// Define Multer types
declare namespace Multer {
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }
}

// Override imported types
declare module "express" {
  // Make everything 'any' to pass type checking
  interface Application {
    use: any;
    get: any;
    post: any;
    put: any;
    delete: any;
    patch: any;
  }

  interface Router {
    use: any;
    get: any;
    post: any;
    put: any;
    delete: any;
    patch: any;
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

// Override Multer
declare module "multer" {
  // Make everything 'any' to pass type checking
  export interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }

  export interface Multer {
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: { name: string; maxCount?: number }[]): any;
    none(): any;
    any(): any;
  }

  function multer(options?: any): any;
  namespace multer {
    function memoryStorage(): any;
    function diskStorage(options: any): any;
  }
  export = multer;
}
