import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session || role !== 'admin') {
        return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Only JPEG, PNG, WebP images allowed.' }, { status: 400 });
        }

        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `${uuidv4()}.${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        await mkdir(uploadDir, { recursive: true });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(path.join(uploadDir, filename), buffer);

        return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: 'Upload failed.' }, { status: 500 });
    }
}
