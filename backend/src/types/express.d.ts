// This file extends the Express Request type to include the `file` and `files` properties from multer.
import 'express';
import { File as MulterFile } from 'multer';

declare global {
  namespace Express {
    interface Request {
      file?: MulterFile;
      files?: MulterFile[];
    }
  }
}
