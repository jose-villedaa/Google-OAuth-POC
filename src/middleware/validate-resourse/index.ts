import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

// eslint-disable-next-line consistent-return
const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (e: unknown) {
    const error = e as Error;
    res.status(400).send(error.message);
  }
};

export default validate;
