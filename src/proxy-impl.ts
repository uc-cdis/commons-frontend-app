import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getRouteConfig } from './lib/auth/arboristConfig';
import { getLoginStatus, type LoginStatus } from './lib/auth/getLoginStatus';
import { fetchArboristMapping } from './lib/auth/fetchAuthz';
import {
  checkRuleAccess,
  getAccessToken,
  resolveRoute,
} from '@gen3/frontend/server';

function isLoggedIn(loginStatus: LoginStatus) {
  return loginStatus.status === 'issued';
}

export async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const { routes: routeConfig } = await getRouteConfig();
  const rule = resolveRoute(routeConfig, pathname);
  const loginStatus = await getLoginStatus(req.headers.get('Cookie') || '');
  const loggedIn = isLoggedIn(loginStatus);

  // Logged in users have no reason to see the Login page: send them to Profile.
  if (pathname === '/Login') {
    if (loggedIn) {
      return NextResponse.redirect(new URL('/Profile', req.url));
    } else {
      return NextResponse.next();
    }
  }

  // Public route: not listed in Arborist config
  if (!rule) {
    return NextResponse.next();
  }

  const needsAuthz = Array.isArray(rule.authz) && rule.authz.length > 0;

  // Only hit Arborist when the route actually has authz entries. The cached
  // mapping is enough here: services re-check on every request.
  let mapping;
  if (needsAuthz && loggedIn) {
    const token = getAccessToken(req.headers.get('Cookie') || '') ?? null;
    mapping = await fetchArboristMapping(
      token,
      process.env.NODE_ENV === 'production',
    );
  }

  const access = checkRuleAccess(rule, { isLoggedIn: loggedIn, mapping });

  if (access === 'allowed') {
    return NextResponse.next();
  }

  if (access === 'loginRequired') {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/Login';
    loginUrl.searchParams.set('referer', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // forbidden: logged in but lacks the required service/method on the resource
  if (rule.redirect403) {
    return NextResponse.redirect(new URL(rule.redirect403, req.url));
  }
  const forbiddenUrl = req.nextUrl.clone();
  forbiddenUrl.pathname = '/403';
  return NextResponse.rewrite(forbiddenUrl);
}
