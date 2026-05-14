import { NextRequest, NextResponse } from 'next/server';
import { getRouteConfig } from './lib/auth/arboristConfig';
import {
  getAccessToken,
  getLoginStatus,
  type LoginStatus,
} from './lib/auth/getLoginStatus';
import { fetchArboristResources } from './lib/auth/fetchAuthz';
import { RouteConfig } from '@gen3/frontend/server';

// Use Node.js runtime so middleware can import server-only modules
// (jose, @gen3/frontend/server, etc.) that require Node APIs unavailable in Edge.
export const runtime = 'nodejs';

const WILDCARD_ROUTE_KEY = '*';

function getRouteRuleForPath(pathname: string, routeConfig: RouteConfig) {
  // handle wildcards
  // get subdirectory
  const pathParts = pathname.split('/');
  // has subdirectory
  if (pathParts.length > 2) {
    const startsWithPath = `/${pathParts[1]}`;
    // look through config for subdirectory
    const routeConfigMatch = Object.keys(routeConfig).find(key => key.startsWith(startsWithPath));
    // check if subdirectory ends with wildcard
    if (routeConfigMatch && routeConfigMatch.endsWith('(.*)')) {
      return routeConfig?.[routeConfigMatch];
    }
  }
  return routeConfig?.[pathname] ?? routeConfig?.[WILDCARD_ROUTE_KEY];
}

function isLoggedIn(loginStatus: LoginStatus) {
  return loginStatus.status === 'issued';
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const { routes: routeConfig } = await getRouteConfig();
  let rule = getRouteRuleForPath(pathname, routeConfig);

  // check if there is a wildcard route
  if (!rule) {
    rule = getRouteRuleForPath('*', routeConfig);
  }

  // Public route: not listed in Arborist config
  if (!rule) {
    return NextResponse.next();
  }

  const loginRequired = rule.loginRequired ?? true;

  if (!loginRequired) {
    return NextResponse.next();
  }

  // Gen3 login check
  const loginStatus = await getLoginStatus(req.headers.get('Cookie') || '');
  const loggedIn = await isLoggedIn(loginStatus);

  // Enforce login if required
  if (!loggedIn) {
    const loginUrl = new URL('/Login', req.url);
    loginUrl.searchParams.set('referer', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const needsAuthz = Array.isArray(rule?.authz) && rule?.authz.length > 0;

  // If no authz resources configured, login is enough
  if (!needsAuthz) {
    return NextResponse.next();
  }

  // Authz is enabled AND route has authzResources → check Arborist resources
  const tokenFromCookie =
    getAccessToken(req.headers.get('Cookie') || '') ?? null;

  // Let the server-side helper resolve resources using the active Gen3 session.
  const resources = await fetchArboristResources(
    tokenFromCookie,
    process.env.NODE_ENV === 'production',
  );

  const allowed = rule?.authz!.some((needed) => resources.includes(needed));
  if (!allowed) {
    // Already logged in if required; they just lack authz for this resource
    return NextResponse.rewrite(new URL('/403', req.url));
  }

  return NextResponse.next();
}
