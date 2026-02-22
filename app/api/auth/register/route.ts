import { NextRequest, NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { getUserByEmail, createUser } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
        }
        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
        }

        const existing = getUserByEmail(email);
        if (existing) {
            return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
        }

        const hash = await bcryptjs.hash(password, 10);
        createUser(name, email, hash);

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        console.error('Register error:', err);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    }
}
