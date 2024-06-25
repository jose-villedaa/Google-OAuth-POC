import jwt from 'jsonwebtoken';
import log from '@utils/logger';
import config from 'config';

const publicKey = config.get<string>('publicKey');

const verifyJwt = (token: string) => {
  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded,
    };
  } catch (e: unknown) {
    if (e instanceof Error) {
      log.error(e);
      return {
        valid: false,
        expired: e.message === 'jwt expired',
        decoded: null,
      };
    }
    log.error('An unexpected error occurred');
    return {
      valid: false,
      expired: false,
      decoded: null,
    };
  }
};

export default verifyJwt;
