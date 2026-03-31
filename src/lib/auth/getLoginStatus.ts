import { parse } from 'cookie';
import { decodeJwt, importSPKI, JWTPayload, jwtVerify } from 'jose';
import { fetchJWTKey } from '@gen3/frontend/server';

export const isExpired = (value: number) => value * 1000 < Date.now();
export interface JWTPayloadAndUser extends JWTPayload {
  context: Record<string, any>;
}

export const getAccessToken = (cookie?: string): string | undefined => {
  const cookies = cookie ? parse(cookie) : {};

  let accessToken = cookies.access_token;
  // in development mode we support "credentials login"
  if (!accessToken && process.env.NODE_ENV === 'development') {
    // NOTE: This cookie can only be accessed from the client side
    // in development mode. Otherwise, the cookie is set as httpOnly
    accessToken = cookies.credentials_token;
  }
  return accessToken;
};

/**
 * returns the access_token expiration, user, and status
 * @param cookie - header cookie to parse
 */

export interface LoginStatus {
  issued?: number;
  expires?: number;
  userContext?: Record<string, any>;
  status: 'issued' | 'expired' | 'invalid' | 'not present';
  error?: string;
}

export async function getLoginStatus(cookie?: string): Promise<LoginStatus> {
  try {
    const accessToken = getAccessToken(cookie);
    if (accessToken) {
      const jwtKey = await fetchJWTKey(process.env.NODE_ENV === 'production');

      if (!jwtKey) {
        return {
          error: 'No JWT Key to verify token',
          status: 'not present',
        };
      }
      // validate the token
      const publicKey = await importSPKI(jwtKey, 'RS256');
      await jwtVerify(accessToken, publicKey);
      const decodedAccessToken = decodeJwt(accessToken) as JWTPayloadAndUser;
      return {
        issued: decodedAccessToken.iat,
        expires: decodedAccessToken.exp,
        userContext: decodedAccessToken.context?.user,
        status: decodedAccessToken.exp
          ? isExpired(decodedAccessToken.exp)
            ? 'expired'
            : 'issued'
          : 'invalid',
      };
    }

    return {
      status: 'not present',
    };
  } catch (error: unknown) {
    console.error('Error getting login status:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'invalid',
    };
  }
}
