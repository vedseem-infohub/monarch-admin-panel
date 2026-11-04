import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Retrieve auth token from cookies
  const adminToken = request.cookies.get('monarch_admin_token')?.value || request.cookies.get('token')?.value;

  // 1. Root route: redirect to dashboard if authenticated, else login
  if (pathname === '/') {
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. /admin/login alias: redirect to clean /login route with searchParams preserved
  if (pathname === '/admin/login') {
    const redirectParam = searchParams.get('redirect');
    const targetUrl = new URL('/login', request.url);
    if (redirectParam) {
      targetUrl.searchParams.set('redirect', redirectParam);
    }
    return NextResponse.redirect(targetUrl);
  }

  // 3. Login page: If already logged in with valid token, redirect directly to dashboard
  if (pathname === '/login') {
    if (adminToken) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 4. Strict Admin Route Protection: All other /admin routes require authentication
  if (pathname.startsWith('/admin')) {
    if (!adminToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, images, public assets
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)',
  ],
};
