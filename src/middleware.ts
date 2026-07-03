import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // By-pass static assets, next internals, and API routes (if any are used in Next.js)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico)$/)
  ) {
    return NextResponse.next();
  }

  // Define public routes that do not require authentication
  const isPublicRoute = pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password';

  // Read the authToken from the cookies
  const authToken = request.cookies.get('authToken')?.value;

  // If the user is unauthenticated and tries to access a protected route
  if (!authToken && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    // Optionally preserve the url they were trying to access
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the user is authenticated and tries to access login page, redirect them to dashboard
  if (authToken && isPublicRoute) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If no redirection is needed, allow the request to proceed
  return NextResponse.next();
}

// Ensure the middleware runs on all paths
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
