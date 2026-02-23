import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
    // We use the DATABASE_URL environment variable here.
    let connectionString = process.env.DATABASE_URL || '';

    // The Neon serverless adapter does not support pgbouncer, 
    // so we must strip the query parameter if it exists.
    if (connectionString.includes('pgbouncer=true')) {
        connectionString = connectionString.replace('?pgbouncer=true', '');
        connectionString = connectionString.replace('&pgbouncer=true', '');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
