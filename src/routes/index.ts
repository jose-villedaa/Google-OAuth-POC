import { Express, Request, Response } from 'express';
import validateResource from '@middleware/validate-resourse';
import requireUser from '@middleware/require-user';
import createSessionSchema from '@schema/session.schema';
import createUserSchema from '@schema/user.schema';
import {
  createUserSessionHandler,
  getUserSessionsHandler,
  deleteSessionHandler,
  googleOauthHandler,
  getOAuthUrlHandler,
} from '@controller/session.controller';
import {
  createUserHandler,
  getCurrentUser,
} from '@controller/user.controller';

function routes(app: Express) {
  // Healthcheck route
  app.get('/healthcheck', (req: Request, res: Response) => res.sendStatus(200));

  // Users routes
  app.post('/api/users', validateResource(createUserSchema), createUserHandler);

  app.get('/api/me', requireUser, getCurrentUser);

  // Sessions routes
  app.post(
    '/api/sessions',
    validateResource(createSessionSchema),
    createUserSessionHandler,
  );

  app.get('/api/sessions', requireUser, getUserSessionsHandler);

  app.delete('/api/sessions', requireUser, deleteSessionHandler);

  app.get('/api/sessions/oauth/google', googleOauthHandler);

  app.get('/api/sessions/oauth/url', getOAuthUrlHandler);
}

export default routes;
