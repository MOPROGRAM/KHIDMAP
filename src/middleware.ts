import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import logger from '@/lib/logger';

export async function middleware(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/verify', '/api/auth/forgot-password', '/api/auth/reset-password'];

  // Allow access to public paths without authentication
  if (publicPaths.some(path => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication attempt with no token or invalid format');
    return NextResponse.json({ message: 'الوصول مرفوض. لا يوجد رمز مميز.' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    // Attach decoded user info to the request headers for API routes to access
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', payload.role as string);
    logger.info(`User ${payload.userId} authenticated successfully.`);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (err: any) {
    logger.error(`Invalid token: ${err.message}`);
    return NextResponse.json({ message: 'الرمز المميز غير صالح.' }, { status: 401 });
  }
}

export const config = {
  matcher: '/api/:path*', // Apply middleware to all /api routes
};