import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SESSION_COOKIE = 'admin_session';
const SESSION_TOKEN = 'authenticated';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /admin routes
    if (!pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    // Allow access to login page
    if (pathname === '/admin/login') {
        return NextResponse.next();
    }

    // Check for session cookie
    const session = request.cookies.get(ADMIN_SESSION_COOKIE);
    const isAuthenticated = session?.value === SESSION_TOKEN;

    if (!isAuthenticated) {
        // Redirect to login page
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
