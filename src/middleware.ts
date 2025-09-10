import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      // The atob function is available in Edge runtime
      const [user, pwd] = atob(authValue).split(':');
      
      const expectedUser = 'admin';
      const expectedPassword = 'KALIroot123';

      if (user === expectedUser && pwd === expectedPassword) {
        return NextResponse.next();
      }
    }

    const url = req.nextUrl;
    url.pathname = '/api/auth';
    
    return new Response('Auth required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
        },
      });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
