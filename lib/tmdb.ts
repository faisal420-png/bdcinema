const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p';

function apiKey(): string {
    const k = process.env.TMDB_API_KEY;
    if (!k || k === 'your_tmdb_api_key_here') throw new Error('TMDB_API_KEY missing');
    return k;
}

export interface TmdbResult {
    id: number;
    title?: string;
    name?: string;
    original_title?: string;
    original_name?: string;
    overview: string;
    release_date?: string;
    first_air_date?: string;
    poster_path: string | null;
    backdrop_path: string | null;
    genre_ids: number[];
    vote_average?: number;
    origin_country?: string[];
    media_type?: string;
    runtime?: number;
    episode_run_time?: number[];
    credit_id?: string;
    credits?: {
        cast: { id: number; name: string; character: string; profile_path: string | null }[];
        crew: { id: number; name: string; job: string; department: string }[];
    };
}

export interface TmdbPerson {
    id: number;
    name: string;
    biography: string;
    profile_path: string | null;
    known_for_department: string;
    birthday: string | null;
    place_of_birth: string | null;
}

interface TmdbGenre { id: number; name: string; }
const genreCache: Record<string, Record<number, string>> = {};

async function getGenres(type: 'movie' | 'tv'): Promise<Record<number, string>> {
    if (genreCache[type]) return genreCache[type];
    const r = await fetch(`${TMDB_BASE}/genre/${type}/list?api_key=${apiKey()}&language=en-US`);
    const d = await r.json() as { genres: TmdbGenre[] };
    const m: Record<number, string> = {};
    for (const g of d.genres) m[g.id] = g.name;
    genreCache[type] = m;
    return m;
}
export { getGenres };

// ── Image helpers ─────────────────────────────
export function img(path: string | null, size = 'w500'): string | null {
    return path ? `${TMDB_IMG}/${size}${path}` : null;
}
export function backdrop(path: string | null): string | null {
    return path ? `${TMDB_IMG}/w1280${path}` : null;
}

// ── Fetchers ──────────────────────────────────
export async function trendingGlobal(): Promise<TmdbResult[]> {
    const r = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${apiKey()}&language=en-US`, { next: { revalidate: 3600 } });
    const d = await r.json() as { results: TmdbResult[] };
    return d.results.filter(i => i.poster_path);
}

export async function popularMovies(): Promise<TmdbResult[]> {
    const r = await fetch(`${TMDB_BASE}/movie/popular?api_key=${apiKey()}&language=en-US&page=1`, { next: { revalidate: 3600 } });
    const d = await r.json() as { results: TmdbResult[] };
    return d.results.filter(i => i.poster_path);
}

export async function topRatedMovies(): Promise<TmdbResult[]> {
    const r = await fetch(`${TMDB_BASE}/movie/top_rated?api_key=${apiKey()}&language=en-US&page=1`, { next: { revalidate: 3600 } });
    const d = await r.json() as { results: TmdbResult[] };
    return d.results.filter(i => i.poster_path);
}

export async function popularSeries(): Promise<TmdbResult[]> {
    const r = await fetch(`${TMDB_BASE}/tv/popular?api_key=${apiKey()}&language=en-US&page=1`, { next: { revalidate: 3600 } });
    const d = await r.json() as { results: TmdbResult[] };
    return d.results.filter(i => i.poster_path);
}

export async function fetchBangladeshiMovies(): Promise<TmdbResult[]> {
    const r = await fetch(`${TMDB_BASE}/discover/movie?api_key=${apiKey()}&with_origin_country=BD&include_image_language=bn,en,null&sort_by=popularity.desc&page=1`, { next: { revalidate: 3600 } });
    const d = await r.json() as { results: TmdbResult[] };
    return d.results;
}

export async function fetchBangladeshiSeries(): Promise<TmdbResult[]> {
    const r = await fetch(`${TMDB_BASE}/discover/tv?api_key=${apiKey()}&with_origin_country=BD&include_image_language=bn,en,null&sort_by=popularity.desc&page=1`, { next: { revalidate: 3600 } });
    const d = await r.json() as { results: TmdbResult[] };
    return d.results;
}

export async function fetchIndianMovies(): Promise<TmdbResult[]> {
    const r = await fetch(`${TMDB_BASE}/discover/movie?api_key=${apiKey()}&with_origin_country=IN&sort_by=popularity.desc&page=1`, { next: { revalidate: 3600 } });
    const d = await r.json() as { results: TmdbResult[] };
    return d.results;
}

export async function fetchIndianSeries(): Promise<TmdbResult[]> {
    const r = await fetch(`${TMDB_BASE}/discover/tv?api_key=${apiKey()}&with_origin_country=IN&sort_by=popularity.desc&page=1`, { next: { revalidate: 3600 } });
    const d = await r.json() as { results: TmdbResult[] };
    return d.results;
}

export async function multiSearch(query: string): Promise<TmdbResult[]> {
    if (!query) return [];
    const r = await fetch(`${TMDB_BASE}/search/multi?api_key=${apiKey()}&language=en-US&query=${encodeURIComponent(query)}&page=1&include_adult=false`, { next: { revalidate: 3600 } });
    const d = await r.json() as { results: TmdbResult[] };
    return d.results;
}

export async function getTmdbDetails(id: number, type: 'movie' | 'tv'): Promise<TmdbResult> {
    const r = await fetch(`${TMDB_BASE}/${type}/${id}?append_to_response=credits&api_key=${apiKey()}&language=en-US`, { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`Failed to fetch TMDB details for ${type} ${id}`);
    const data = await r.json() as TmdbResult;
    return data;
}

export async function getTmdbPerson(id: number): Promise<TmdbPerson> {
    const r = await fetch(`${TMDB_BASE}/person/${id}?api_key=${apiKey()}&language=en-US`, { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`Failed to fetch TMDB person ${id}`);
    return await r.json() as TmdbPerson;
}

export async function getTmdbPersonCredits(id: number): Promise<{ cast: TmdbResult[]; crew: TmdbResult[] }> {
    const r = await fetch(`${TMDB_BASE}/person/${id}/combined_credits?api_key=${apiKey()}&language=en-US`, { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error(`Failed to fetch TMDB person credits ${id}`);
    return await r.json();
}

// ── Sync to local db ──────────────────────────
export async function syncBangladeshiContent() {
    const { upsertTmdbMovie } = await import('./db');
    const [movies, series] = await Promise.all([fetchBangladeshiMovies(), fetchBangladeshiSeries()]);
    const [mg, tg] = await Promise.all([getGenres('movie'), getGenres('tv')]);
    let synced = 0;
    for (const m of movies) {
        const g = m.genre_ids.map(id => mg[id]).filter(Boolean);
        upsertTmdbMovie({
            tmdb_id: m.id, title: m.title || m.name || 'Unknown',
            original_title: m.original_title || m.original_name || null,
            overview: m.overview || null,
            release_year: m.release_date ? parseInt(m.release_date.split('-')[0]) : null,
            poster_url: img(m.poster_path), backdrop_url: backdrop(m.backdrop_path),
            type: 'movie', source: 'tmdb', genres: JSON.stringify(g),
        }); synced++;
    }
    for (const s of series) {
        const g = s.genre_ids.map(id => tg[id]).filter(Boolean);
        upsertTmdbMovie({
            tmdb_id: s.id, title: s.name || s.title || 'Unknown',
            original_title: s.original_name || s.original_title || null,
            overview: s.overview || null,
            release_year: s.first_air_date ? parseInt(s.first_air_date.split('-')[0]) : null,
            poster_url: img(s.poster_path), backdrop_url: backdrop(s.backdrop_path),
            type: 'series', source: 'tmdb', genres: JSON.stringify(g),
        }); synced++;
    }
    return { synced, movies: movies.length, series: series.length };
}
