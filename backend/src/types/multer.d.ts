declare module "multer" {
  import { Request } from "express";

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

  export interface StorageEngine {}

  export interface DiskStorageOptions {
    destination?:
      | string
      | ((
          req: Request,
          file: File,
          callback: (error: Error | null, destination: string) => void
        ) => void);
    filename?: (
      req: Request,
      file: File,
      callback: (error: Error | null, filename: string) => void
    ) => void;
  }

  export interface MemoryStorageOptions {}

  interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    fileFilter?: (
      req: Request,
      file: File,
      callback: (error: Error | null, acceptFile: boolean) => void
    ) => void;
    preservePath?: boolean;
  }

  function multer(options?: Options): Multer;

  namespace multer {
    export function memoryStorage(
      options?: MemoryStorageOptions
    ): StorageEngine;
    export function diskStorage(options: DiskStorageOptions): StorageEngine;
  }

  export = multer;
}
