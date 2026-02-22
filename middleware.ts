import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
    if (isAdminRoute) {
        const session = req.auth;
        const role = (session?.user as { role?: string })?.role;
        if (!session || role !== 'admin') {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }
    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*'],
};
