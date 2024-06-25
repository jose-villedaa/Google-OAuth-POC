import {
  DocumentDefinition,
  FilterQuery,
  QueryOptions,
  UpdateQuery,
} from 'mongoose';
import qs from 'qs';
import config from 'config';
import axios from 'axios';
import { omit } from 'lodash';
import log from '@utils/logger';
import { UserDocument } from 'src/documents';
import UserModel from '../models/user.model';

export async function createUser(
  input: DocumentDefinition<
  Omit<UserDocument, 'createdAt' | 'updatedAt' | 'comparePassword'>
  >,
) {
  try {
    const user = await UserModel.create(input);
    return omit(user.toJSON(), 'password');
  } catch (e: unknown) {
    if (e instanceof Error) {
      throw e;
    } else {
      throw new Error(String(e));
    }
  }
}

export async function validatePassword({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const user = await UserModel.findOne({ email });

  if (!user) {
    return false;
  }

  const isValid = await user.comparePassword(password);

  if (!isValid) return false;

  return omit(user.toJSON(), 'password');
}

export async function findUser(query: FilterQuery<UserDocument>) {
  return UserModel.findOne(query).lean();
}

interface GoogleTokensResult {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  id_token: string;
}

export async function getGoogleOAuthTokens({
  code,
}: {
  code: string;
}): Promise<GoogleTokensResult> {
  const url = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: config.get('googleOAuth.clientId'),
    client_secret: config.get('googleOAuth.clientSecret'),
    redirect_uri: config.get('googleOAuth.redirectUrl'),
    grant_type: 'authorization_code',
  };

  try {
    const res = await axios.post<GoogleTokensResult>(
      url,
      qs.stringify(values),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );
    return res.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    log.error(error.response.data.error);
    log.error(error, 'Failed to fetch Google Oauth Tokens');
    throw new Error(error.message);
  }
}

interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function getGoogleUser({
  id_token,
  access_token,
}: Partial<GoogleTokensResult>): Promise<GoogleUserResult> {
  try {
    const res = await axios.get<GoogleUserResult>(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      },
    );
    return res.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      log.error(error.message, 'Error fetching Google user');
      throw new Error(error.message);
    } else {
      log.error('An unknown error occurred', 'Error fetching Google user');
      throw new Error('An unknown error occurred');
    }
  }
}

export async function findAndUpdateUser(
  query: FilterQuery<UserDocument>,
  update: UpdateQuery<UserDocument>,
  options: QueryOptions = {},
) {
  return UserModel.findOneAndUpdate(query, update, options);
}

export function getGoogleOAuthURL(): string {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: config.get('googleOAuth.redirectUrl') as string,
    client_id: config.get('googleOAuth.clientId') as string,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' '),
  };

  const googleUrl = new URLSearchParams(options as Record<string, string>).toString();
  return `${rootUrl}?${googleUrl}`;
}
