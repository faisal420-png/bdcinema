import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcryptjs from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { authConfig } from './auth.config';

// Build providers list — only add Google if credentials are present
const providers: any[] = [
    Credentials({
        name: 'credentials',
        credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
            if (!credentials?.email || !credentials?.password) return null;

            const user = await prisma.user.findUnique({
                where: { email: credentials.email as string }
            });
            if (!user || !user.password_hash) return null;

            const valid = await bcryptjs.compare(
                credentials.password as string,
                user.password_hash
            );
            if (!valid) return null;

            return {
                id: String(user.id),
                name: user.name,
                email: user.email,
                role: user.role,
            };
        },
    }),
];

// Only add Google OAuth if credentials are properly configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.unshift(
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
