import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    trustHost: true,
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
