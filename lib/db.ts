import { prisma } from './prisma';
import type { User, Movie, Review, WatchlistItem, WatchedItem, InterestedItem } from '@prisma/client';

export type MovieWithStats = Movie & {
    review_count: number;
    ratings: string | null;
};
export type ReviewWithUser = Review & { user_name: string };
export type WatchlistItemWithMovie = WatchlistItem & { movie: Movie };
export type WatchedItemWithMovie = WatchedItem & { movie: Movie };

// ── User queries ─────────────────────────────────
export async function getUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
}

export async function createUser(name: string, email: string, passwordHash: string) {
    return prisma.user.create({
        data: { name, email, password_hash: passwordHash, role: 'user' }
    });
}

// ── Movie queries ─────────────────────────────────
export async function getAllMovies(): Promise<MovieWithStats[]> {
    const movies = await prisma.movie.findMany({
        include: { reviews: true },
        orderBy: { created_at: 'desc' }
    });
    return movies.map(m => ({
        ...m,
        review_count: m.reviews.length,
        ratings: m.reviews.map(r => r.meter_rating).join(',') || null
    }));
}

export async function getMovieById(id: number) {
    return prisma.movie.findUnique({ where: { id } });
}

export async function getMovieByTmdbId(tmdb_id: number) {
    return prisma.movie.findUnique({ where: { tmdb_id } });
}

export async function createMovie(data: Omit<Movie, 'id' | 'created_at'>) {
    return prisma.movie.create({ data });
}

export async function deleteMovie(id: number) {
    await prisma.movie.delete({ where: { id } });
}

export async function upsertTmdbMovie(data: Omit<Movie, 'id' | 'created_at'>) {
    if (data.tmdb_id) {
        const existing = await getMovieByTmdbId(data.tmdb_id);
        if (existing) {
            return prisma.movie.update({ where: { id: existing.id }, data });
        }
    }
    return prisma.movie.create({ data });
}

// ── Review queries ────────────────────────────────
export async function getReviewsByMovieId(movieId: number): Promise<ReviewWithUser[]> {
    const reviews = await prisma.review.findMany({
        where: { movie_id: movieId },
        include: { user: true },
        orderBy: { created_at: 'desc' }
    });
    return reviews.map(r => ({ ...r, user_name: r.user?.name ?? 'Unknown' }));
}

export async function createReview(movieId: number, userId: string, meterRating: string, body: string) {
    return prisma.review.upsert({
        where: { movie_id_user_id: { movie_id: movieId, user_id: userId } },
        update: { meter_rating: meterRating, body },
        create: { movie_id: movieId, user_id: userId, meter_rating: meterRating, body }
    });
}

export async function getReviewByUserAndMovie(userId: string, movieId: number) {
    const review = await prisma.review.findUnique({
        where: { movie_id_user_id: { movie_id: movieId, user_id: userId } },
        include: { user: true }
    });
    if (!review) return undefined;
    return { ...review, user_name: review.user?.name ?? 'Unknown' };
}

export async function getUserReviews(userId: string) {
    return prisma.review.findMany({
        where: { user_id: userId },
        include: { movie: true },
        orderBy: { created_at: 'desc' }
    });
}

// ── Watchlist queries ─────────────────────────────
export async function getUserWatchlist(userId: string): Promise<WatchlistItemWithMovie[]> {
    return prisma.watchlistItem.findMany({
        where: { user_id: userId },
        include: { movie: true },
        orderBy: { created_at: 'desc' }
    });
}

export async function toggleWatchlist(userId: string, movieId: number) {
    const existing = await prisma.watchlistItem.findUnique({
        where: { movie_id_user_id: { movie_id: movieId, user_id: userId } }
    });
    if (existing) {
        await prisma.watchlistItem.delete({ where: { id: existing.id } });
    } else {
        await prisma.watchlistItem.create({
            data: { movie_id: movieId, user_id: userId }
        });
    }
}

export async function isInWatchlist(userId: string, movieId: number): Promise<boolean> {
    const item = await prisma.watchlistItem.findUnique({
        where: { movie_id_user_id: { movie_id: movieId, user_id: userId } }
    });
    return !!item;
}

// ── Watched queries ───────────────────────────────
export async function getUserWatched(userId: string): Promise<WatchedItemWithMovie[]> {
    return prisma.watchedItem.findMany({
        where: { user_id: userId },
        include: { movie: true },
        orderBy: { watched_at: 'desc' }
    });
}

export async function toggleWatched(userId: string, movieId: number) {
    const existing = await prisma.watchedItem.findUnique({
        where: { movie_id_user_id: { movie_id: movieId, user_id: userId } }
    });
    if (existing) {
        await prisma.watchedItem.delete({ where: { id: existing.id } });
        return false;
    } else {
        await prisma.watchedItem.create({
            data: { movie_id: movieId, user_id: userId }
        });
        return true;
    }
}

export async function isWatched(userId: string, movieId: number): Promise<boolean> {
    const item = await prisma.watchedItem.findUnique({
        where: { movie_id_user_id: { movie_id: movieId, user_id: userId } }
    });
    return !!item;
}

// ── Interested queries ────────────────────────────
export async function getUserInterested(userId: string) {
    return prisma.interestedItem.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' }
    });
}

export async function toggleInterested(userId: string, tmdbId: number, mediaType: string) {
    const existing = await prisma.interestedItem.findUnique({
        where: { tmdb_id_user_id: { tmdb_id: tmdbId, user_id: userId } }
    });
    if (existing) {
        await prisma.interestedItem.delete({ where: { id: existing.id } });
        return false;
    } else {
        await prisma.interestedItem.create({
            data: { tmdb_id: tmdbId, media_type: mediaType, user_id: userId }
        });
        return true;
    }
}

export async function isInterested(userId: string, tmdbId: number): Promise<boolean> {
    const item = await prisma.interestedItem.findUnique({
        where: { tmdb_id_user_id: { tmdb_id: tmdbId, user_id: userId } }
    });
    return !!item;
}
