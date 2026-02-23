import { NextResponse } from 'next/server';

export async function GET() {
    const rawUrl = process.env.DATABASE_URL;
    let safeUrl = 'NOT_SET';

    if (rawUrl) {
        // Redact the password from the connection string for safety
        safeUrl = rawUrl.replace(/:([^:@]+)@/, ':***@');
    }

    return NextResponse.json({
        database_url: safeUrl,
        node_env: process.env.NODE_ENV
    });
}
