import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserReviews } from '@/lib/db';
import ProfileClient from '@/app/profile/ProfileClient';
import AdminClient from './AdminClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        redirect('/login');
    }

    const userId = parseInt((session.user as { id: string }).id);
    const reviews = getUserReviews(userId);

    const userInfo = {
        name: session.user.name || '',
        email: session.user.email || '',
        created_at: (session.user as any).created_at
    };

    const hasTmdbKey = !!process.env.TMDB_API_KEY && process.env.TMDB_API_KEY !== 'your_tmdb_api_key_here';

    return (
        <ProfileClient user={userInfo} reviews={reviews}>
            <AdminClient hasTmdbKey={hasTmdbKey} />
        </ProfileClient>
    );
}
