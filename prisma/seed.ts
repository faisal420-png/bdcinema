import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    const dataPath = path.join(process.cwd(), 'bdcinema-data.json');
    if (!fs.existsSync(dataPath)) {
        console.log('No legacy data found. Skipping seed.');
        return;
    }

    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Clear out any existing data before seeding to avoid duplicates
    await prisma.watchlistItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.movie.deleteMany();
    await prisma.user.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();

    console.log('Seeding Users...');
    const userIdMap: Record<number, string> = {};
    for (const u of rawData.users) {
        const createdUser = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                name: u.name,
                email: u.email,
                password_hash: u.password_hash,
                role: u.role,
                created_at: new Date(u.created_at)
            }
        });
        userIdMap[u.id] = createdUser.id;
    }

    console.log('Seeding Movies...');
    for (const m of rawData.movies) {
        await prisma.movie.upsert({
            where: { id: m.id },
            update: {},
            create: {
                id: m.id, // Preserve ID to maintain relational integrity with TMDB
                tmdb_id: m.tmdb_id,
                title: m.title,
                original_title: m.original_title,
                overview: m.overview,
                release_year: m.release_year,
                poster_url: m.poster_url,
                backdrop_url: m.backdrop_url,
                type: m.type,
                source: m.source,
                genres: m.genres,
                created_at: new Date(m.created_at)
            }
        });
    }

    console.log('Seeding Reviews...');
    for (const r of rawData.reviews) {
        if (!userIdMap[r.user_id]) continue;
        await prisma.review.upsert({
            where: { movie_id_user_id: { movie_id: r.movie_id, user_id: userIdMap[r.user_id] } },
            update: {},
            create: {
                movie_id: r.movie_id,
                user_id: userIdMap[r.user_id],
                meter_rating: r.meter_rating,
                body: r.body,
                created_at: new Date(r.created_at)
            }
        });
    }

    console.log('Seeding Watchlists...');
    for (const w of rawData.watchlists) {
        if (!userIdMap[w.user_id]) continue;
        await prisma.watchlistItem.upsert({
            where: { movie_id_user_id: { movie_id: w.movie_id, user_id: userIdMap[w.user_id] } },
            update: {},
            create: {
                movie_id: w.movie_id,
                user_id: userIdMap[w.user_id],
                created_at: new Date(w.created_at)
            }
        });
    }

    console.log('Seeding completed successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
