import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { getUserReviews } from '@/lib/db';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfileDashboard() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const userId = (session.user as { id: string }).id;
    const reviews = await getUserReviews(userId);

    const userInfo = {
        name: session.user.name || '',
        email: session.user.email || '',
        created_at: (session.user as any).created_at
    };

    return <ProfileClient user={userInfo} reviews={reviews} />;
}
