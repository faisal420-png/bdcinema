import type { NextAuthConfig } from 'next-auth';

// Use secure prefix in production for custom cookies
const isProd = process.env.NODE_ENV === 'production';
const prefix = isProd ? '__Secure-' : '';
const hostPrefix = isProd ? '__Host-' : '';

export const authConfig = {
    trustHost: true,
    cookies: {
        sessionToken: {
            name: `${prefix}bdcinema.session-token`,
            options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isProd }
        },
        callbackUrl: {
            name: `${prefix}bdcinema.callback-url`,
            options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isProd }
        },
        csrfToken: {
            name: `${hostPrefix}bdcinema.csrf-token`,
            options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isProd }
        },
        pkceCodeVerifier: {
            name: `${prefix}bdcinema.pkce.code_verifier`,
            options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isProd, maxAge: 900 }
        },
        state: {
            name: `${prefix}bdcinema.state`,
            options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isProd, maxAge: 900 }
        },
        nonce: {
            name: `${prefix}bdcinema.nonce`,
            options: { httpOnly: true, sameSite: 'lax', path: '/', secure: isProd }
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role ?? 'user';
                token.image = user.image ?? null;
            }
            // Allow updating the token when session is updated (e.g. after avatar upload)
            if (trigger === 'update' && session?.image !== undefined) {
                token.image = session.image;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role as string;
                session.user.image = token.image as string | null;
            }
            return session;
        },
    },
    providers: [], // Add providers in auth.ts (Node compatible)
} satisfies NextAuthConfig;
