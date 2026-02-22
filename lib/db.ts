import fs from 'fs';
import path from 'path';
import bcryptjs from 'bcryptjs';

// ────────────────────────────────────────────────
// Pure Node.js JSON file store — zero dependencies,
// zero native compilation, works on any Node version
// ────────────────────────────────────────────────

const DB_PATH = path.join(process.cwd(), 'bdcinema-data.json');

type DbSchema = {
    users: User[];
    movies: Movie[];
    reviews: Review[];
    watchlists: WatchlistItem[];
    _nextId: { users: number; movies: number; reviews: number; watchlists: number };
};

// In-memory store — loaded once per process
const globalForDb = globalThis as typeof globalThis & { __jsonDb?: DbSchema };

function getDb(): DbSchema {
    if (!globalForDb.__jsonDb) {
        globalForDb.__jsonDb = loadDb();
    }
    return globalForDb.__jsonDb;
}

function loadDb(): DbSchema {
    if (fs.existsSync(DB_PATH)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8')) as Partial<DbSchema>;
            if (!parsed.users) parsed.users = [];
            if (!parsed.movies) parsed.movies = [];
            if (!parsed.reviews) parsed.reviews = [];
            if (!parsed.watchlists) parsed.watchlists = [];
            if (!parsed._nextId) {
                parsed._nextId = { users: 1, movies: 1, reviews: 1, watchlists: 1 };
            } else {
                if (typeof parsed._nextId.watchlists !== 'number') parsed._nextId.watchlists = 1;
                if (typeof parsed._nextId.reviews !== 'number') parsed._nextId.reviews = 1;
                if (typeof parsed._nextId.users !== 'number') parsed._nextId.users = 1;
                if (typeof parsed._nextId.movies !== 'number') parsed._nextId.movies = 1;
            }
            return parsed as DbSchema;
        } catch {
            // corrupted — start fresh
        }
    }
    const fresh: DbSchema = {
        users: [],
        movies: [],
        reviews: [],
        watchlists: [],
        _nextId: { users: 1, movies: 1, reviews: 1, watchlists: 1 },
    };
    seedAll(fresh);
    saveDb(fresh);
    return fresh;
}

function saveDb(db: DbSchema) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function nextId(db: DbSchema, table: keyof DbSchema['_nextId']): number {
    return db._nextId[table]++;
}

function save() { saveDb(getDb()); }

// ── Seed ─────────────────────────────────────────
function seedAll(db: DbSchema) {
    // Admin user
    const hash = bcryptjs.hashSync('admin', 10);
    db.users.push({
        id: nextId(db, 'users'),
        name: 'Admin',
        email: 'admin@bdcinema.local',
        password_hash: hash,
        role: 'admin',
        created_at: new Date().toISOString(),
    });

    // Sample movies/series
    const samples = [
        {
            title: 'Hawa', original_title: 'হাওয়া',
            overview: "A mysterious thriller about fishermen who encounter something supernatural at sea. One of Bangladesh's most celebrated films of 2022.",
            release_year: 2022,
            poster_url: 'https://image.tmdb.org/t/p/w500/sPoWfySFNDCFAFPbcFvXcDjPrfV.jpg',
            backdrop_url: null, type: 'movie' as const, source: 'custom' as const,
            genres: '["Thriller","Mystery","Horror"]', tmdb_id: 977790,
        },
        {
            title: 'Karagar', original_title: 'কারাগার',
            overview: 'A gripping Bangladeshi web series set inside a prison, exploring power, justice, corruption, and survival.',
            release_year: 2022, poster_url: null, backdrop_url: null,
            type: 'series' as const, source: 'custom' as const,
            genres: '["Drama","Crime","Thriller"]', tmdb_id: null,
        },
        {
            title: 'Mohanagar', original_title: 'মহানগর',
            overview: 'A critically acclaimed Bangladeshi crime thriller following a police detective navigating corruption in the big city.',
            release_year: 2021, poster_url: null, backdrop_url: null,
            type: 'series' as const, source: 'custom' as const,
            genres: '["Crime","Drama","Mystery"]', tmdb_id: null,
        },
        {
            title: 'Taqdeer', original_title: 'তাকদীর',
            overview: 'A high-octane Bangladeshi action thriller about a wrongfully accused man who must uncover the truth.',
            release_year: 2021, poster_url: null, backdrop_url: null,
            type: 'series' as const, source: 'custom' as const,
            genres: '["Action","Thriller","Crime"]', tmdb_id: null,
        },
        {
            title: 'Debi', original_title: 'দেবী',
            overview: "A supernatural mystery based on Humayun Ahmed's novel. A landmark in Bangladeshi supernatural cinema.",
            release_year: 2018, poster_url: null, backdrop_url: null,
            type: 'movie' as const, source: 'custom' as const,
            genres: '["Supernatural","Mystery","Drama"]', tmdb_id: null,
        },
        {
            title: 'Shonibar Bikel', original_title: 'শনিবার বিকেল',
            overview: "A raw harrowing account of the 2016 Holey Artisan Cafe terrorist attack — Bangladesh's most powerful film.",
            release_year: 2019, poster_url: null, backdrop_url: null,
            type: 'movie' as const, source: 'custom' as const,
            genres: '["Drama","Historical","Thriller"]', tmdb_id: null,
        },
    ];

    for (const m of samples) {
        db.movies.push({
            id: nextId(db, 'movies'),
            tmdb_id: m.tmdb_id ?? null,
            title: m.title, original_title: m.original_title,
            overview: m.overview, release_year: m.release_year,
            poster_url: m.poster_url ?? null, backdrop_url: m.backdrop_url ?? null,
            type: m.type, source: m.source, genres: m.genres,
            created_at: new Date().toISOString(),
        });
    }
}

// ── User queries ─────────────────────────────────
export function getUserByEmail(email: string) {
    return getDb().users.find(u => u.email === email);
}

export function createUser(name: string, email: string, passwordHash: string) {
    const db = getDb();
    const user: User = {
        id: nextId(db, 'users'),
        name, email, password_hash: passwordHash,
        role: 'user',
        created_at: new Date().toISOString(),
    };
    db.users.push(user);
    save();
    return user;
}

// ── Movie queries ─────────────────────────────────
export function getAllMovies(): MovieWithStats[] {
    const db = getDb();
    return db.movies.map(m => {
        const reviews = db.reviews.filter(r => r.movie_id === m.id);
        return {
            ...m,
            review_count: reviews.length,
            ratings: reviews.map(r => r.meter_rating).join(',') || null,
        };
    }).sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getMovieById(id: number): Movie | undefined {
    return getDb().movies.find(m => m.id === id);
}

export function getMovieByTmdbId(tmdbId: number): Movie | undefined {
    return getDb().movies.find(m => m.tmdb_id === tmdbId);
}

export function createMovie(data: Omit<Movie, 'id' | 'created_at'>) {
    const db = getDb();
    const movie: Movie = {
        id: nextId(db, 'movies'),
        ...data,
        created_at: new Date().toISOString(),
    };
    db.movies.push(movie);
    save();
    return movie;
}

export function deleteMovie(id: number) {
    const db = getDb();
    db.movies = db.movies.filter(m => m.id !== id);
    db.reviews = db.reviews.filter(r => r.movie_id !== id);
    save();
}

export function upsertTmdbMovie(data: Omit<Movie, 'id' | 'created_at'>) {
    const db = getDb();
    const existing = data.tmdb_id ? db.movies.find(m => m.tmdb_id === data.tmdb_id) : null;
    if (existing) {
        Object.assign(existing, data);
        save();
        return existing;
    }
    return createMovie(data);
}

// ── Review queries ────────────────────────────────
export function getReviewsByMovieId(movieId: number): ReviewWithUser[] {
    const db = getDb();
    return db.reviews
        .filter(r => r.movie_id === movieId)
        .map(r => ({
            ...r,
            user_name: db.users.find(u => u.id === r.user_id)?.name ?? 'Unknown',
        }))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createReview(movieId: number, userId: number, meterRating: string, body: string) {
    const db = getDb();
    // Upsert — one review per user per movie
    const idx = db.reviews.findIndex(r => r.movie_id === movieId && r.user_id === userId);
    const review: Review = {
        id: idx >= 0 ? db.reviews[idx].id : nextId(db, 'reviews'),
        movie_id: movieId,
        user_id: userId,
        meter_rating: meterRating as Review['meter_rating'],
        body: body || null,
        created_at: new Date().toISOString(),
    };
    if (idx >= 0) db.reviews[idx] = review;
    else db.reviews.push(review);
    save();
    return review;
}

export function getReviewByUserAndMovie(userId: number, movieId: number): ReviewWithUser | undefined {
    const db = getDb();
    const r = db.reviews.find(r => r.user_id === userId && r.movie_id === movieId);
    if (!r) return undefined;
    return { ...r, user_name: db.users.find(u => u.id === r.user_id)?.name ?? 'Unknown' };
}

export function getUserReviews(userId: number): (Review & { movie: Movie })[] {
    const db = getDb();
    const reviews = db.reviews.filter(r => r.user_id === userId);
    return reviews.map(r => {
        const movie = db.movies.find(m => m.id === r.movie_id);
        return {
            ...r,
            movie: movie as Movie,
        };
    }).filter(r => r.movie !== undefined)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// ── Watchlist queries ─────────────────────────────
export function getUserWatchlist(userId: number): WatchlistItemWithMovie[] {
    const db = getDb();
    const items = db.watchlists.filter(w => w.user_id === userId);
    return items.map(item => {
        const movie = db.movies.find(m => m.id === item.movie_id);
        return {
            ...item,
            movie: movie as Movie,
        };
    }).filter(i => i.movie !== undefined)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function toggleWatchlist(userId: number, movieId: number) {
    const db = getDb();
    const existingIndex = db.watchlists.findIndex(w => w.user_id === userId && w.movie_id === movieId);
    if (existingIndex >= 0) {
        db.watchlists.splice(existingIndex, 1);
    } else {
        db.watchlists.push({
            id: nextId(db, 'watchlists'),
            user_id: userId,
            movie_id: movieId,
            created_at: new Date().toISOString()
        });
    }
    save();
}

export function isInWatchlist(userId: number, movieId: number): boolean {
    const db = getDb();
    return db.watchlists.some(w => w.user_id === userId && w.movie_id === movieId);
}

// ── Types ─────────────────────────────────────────
export type User = {
    id: number;
    name: string;
    email: string;
    password_hash: string;
    role: string;
    created_at: string;
};

export type Movie = {
    id: number;
    tmdb_id: number | null;
    title: string;
    original_title: string | null;
    overview: string | null;
    release_year: number | null;
    poster_url: string | null;
    backdrop_url: string | null;
    type: 'movie' | 'series';
    source: 'tmdb' | 'custom';
    genres: string;
    created_at: string;
};

export type MovieWithStats = Movie & {
    review_count: number;
    ratings: string | null;
};

export type Review = {
    id: number;
    movie_id: number;
    user_id: number;
    meter_rating: 'disaster' | 'timepass' | 'go_for_it' | 'perfection';
    body: string | null;
    created_at: string;
};

export type ReviewWithUser = Review & { user_name: string };

export type WatchlistItem = {
    id: number;
    user_id: number;
    movie_id: number;
    created_at: string;
};

export type WatchlistItemWithMovie = WatchlistItem & { movie: Movie };
