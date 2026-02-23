import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only JPEG, PNG, WebP allowed.' }, { status: 400 });
        }

        // Max 2MB
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Max 2MB.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const mimeType = file.type;
        const dataUrl = `data:${mimeType};base64,${base64}`;

        // Update user image in database
        const userId = (session.user as { id: string }).id;
        await prisma.user.update({
            where: { id: userId },
            data: { image: dataUrl },
        });

        return NextResponse.json({ image: dataUrl }, { status: 200 });
    } catch (err) {
        console.error('Avatar upload error:', err);
        return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }
}
