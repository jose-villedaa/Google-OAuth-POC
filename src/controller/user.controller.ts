import { Request, Response } from 'express';
import logger from '@utils/logger';
import { createUser } from '@service/user.service';
import { CreateUserInput } from '@schema/user.schema';

export async function createUserHandler(
  req: Request<Record<string, never>, Record<string, never>, CreateUserInput['body']>,
  res: Response,
) {
  try {
    const user = await createUser(req.body);
    return res.send(user);
  } catch (e: unknown) {
    logger.error(String(e));
    if (e instanceof Error) {
      return res.status(409).send(e.message);
    }
    return res.status(409).send('An error occurred');
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  return res.send(res.locals.user);
}
