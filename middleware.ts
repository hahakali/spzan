import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('flowstream-auth')?.value === 'true';
  const url = request.nextUrl.clone();

  // If the user is trying to access an admin page and is not authenticated,
  // redirect them to the login page.
  if (url.pathname.startsWith('/admin') && !isAuthenticated) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and tries to access the login page,
  // redirect them to the admin dashboard.
  if (url.pathname === '/login' && isAuthenticated) {
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Protect all admin routes and the login page itself
  matcher: ['/admin/:path*', '/login'],
};
