import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookie } from 'cookies-next';
import { decodeJwt, JWTPayload } from 'jose';

export const isExpired = (value: number) => value - Date.now() > 0;

export interface JWTPayloadAndUser extends JWTPayload {
  context: Record<string, string>;
}

/**
 * returns the access_token expiration, user, and status
 * @param req
 * @param res
 */
export default async function (req: NextApiRequest, res: NextApiResponse) {

  const access_token = getCookie('access_token', { req, res });
  if (access_token && typeof access_token === 'string') {
    // TODO: validate the token
    const decodedAccessToken = decodeJwt(
      access_token
    ) as unknown as JWTPayloadAndUser;
    return res.status(200).json({
      issued: decodedAccessToken.iat,
      expires: decodedAccessToken.exp,
      user: decodedAccessToken.context.user,
      status: decodedAccessToken.exp
        ? isExpired(decodedAccessToken.exp)
          ? 'expired'
          : 'issued'
        : 'invalid',
    });
  }

  return res.status(200).json({
    status: 'not present',
  });
}
