import { CookieOptions, Request, Response } from 'express';
import config from 'config';
import signJwt from '@utils/signJwt';
import log from '@utils/logger';
import {
  createSession,
  findSessions,
  updateSession,
} from '../service/session.service';
import {
  findAndUpdateUser,
  getGoogleOAuthTokens,
  getGoogleOAuthURL,
  getGoogleUser,
  validatePassword,
} from '../service/user.service';

const accessTokenCookieOptions: CookieOptions = {
  maxAge: 900000,
  httpOnly: true,
  domain: 'localhost',
  path: '/',
  sameSite: 'lax',
  secure: false,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...accessTokenCookieOptions,
  maxAge: 3.154e10,
};

export async function createUserSessionHandler(req: Request, res: Response) {
  // Validate the user's password
  const user = await validatePassword(req.body);

  if (!user) {
    return res.status(401).send('Invalid email or password');
  }

  // create a session
  const session = await createSession(user._id, req.get('user-agent') || '');

  // create an access token
  const accessToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get('accessTokenTtl') },
  );

  // create a refresh token
  const refreshToken = signJwt(
    { ...user, session: session._id },
    { expiresIn: config.get('refreshTokenTtl') },
  );

  // return access & refresh tokens

  res.cookie('accessToken', accessToken, accessTokenCookieOptions);

  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  return res.send({ accessToken, refreshToken });
}

export async function getUserSessionsHandler(req: Request, res: Response) {
  const userId = res.locals.user._id;

  const sessions = await findSessions({ user: userId, valid: true });

  return res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session;

  await updateSession({ _id: sessionId }, { valid: false });

  return res.send({
    accessToken: null,
    refreshToken: null,
  });
}

/* eslint-disable consistent-return */
export async function googleOauthHandler(req: Request, res: Response) {
  // Get the code from QS
  const code = req.query.code as string;

  try {
    // Get the id and access token with the code
    const { id_token, access_token } = await getGoogleOAuthTokens({ code });
    log.debug({ id_token, access_token });

    // get user with tokens
    const googleUser = await getGoogleUser({ id_token, access_token });

    log.debug({ googleUser });

    if (!googleUser.verified_email) {
      return res.status(403).send('Google account is not verified');
    }

    // Upsert the user
    const user = await findAndUpdateUser(
      {
        email: googleUser.email,
      },
      {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      },
      {
        upsert: true,
        new: true,
      },
    );

    // Create a session
    const session = await createSession(user?._id, req.get('user-agent') || '');

    // Create an access token
    const accessToken = signJwt(
      { ...user?.toJSON(), session: session._id },
      { expiresIn: config.get('accessTokenTtl') },
    );

    // Create a refresh token
    const refreshToken = signJwt(
      { ...user?.toJSON(), session: session._id },
      { expiresIn: config.get('refreshTokenTtl') },
    );

    // Set cookies
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);

    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    res.redirect(config.get('origin'));
  } catch (error) {
    if (error instanceof Error) {
      log.error(
        { message: error.message, stack: error.stack },
        'Failed to authorize Google user',
      );
    } else {
      log.error('Failed to authorize Google user with unknown error type');
    }
    return res.redirect(`${config.get('origin')}/oauth/error`);
  }
}

export async function getOAuthUrlHandler(_: Request, res: Response) {
  const googleOAuthUrl = getGoogleOAuthURL();
  return res.send({ url: googleOAuthUrl });
}
