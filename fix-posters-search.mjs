import fs from 'fs';

async function run() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const keyMatch = envFile.match(/TMDB_API_KEY=(.*)/);
    const key = keyMatch ? keyMatch[1].trim() : null;

    if (!key) throw new Error('No API key found in .env.local');

    const db = JSON.parse(fs.readFileSync('bdcinema-data.json', 'utf8'));

    for (let m of db.movies.filter(m => m.source === 'custom')) {
        try {
            const searchUrl = `https://api.themoviedb.org/3/search/${m.type === 'series' ? 'tv' : 'movie'}?query=${encodeURIComponent(m.original_title || m.title)}&api_key=${key}&language=en-US`;
            let res = await fetch(searchUrl);
            let data = await res.json();

            // If original_title search failed, try title
            if (!data.results || data.results.length === 0) {
                const searchUrlTitle = `https://api.themoviedb.org/3/search/${m.type === 'series' ? 'tv' : 'movie'}?query=${encodeURIComponent(m.title)}&api_key=${key}&language=en-US`;
                res = await fetch(searchUrlTitle);
                data = await res.json();
            }

            if (data.results && data.results.length > 0) {
                const topResult = data.results[0];
                m.tmdb_id = topResult.id;
                if (topResult.poster_path) {
                    m.poster_url = 'https://image.tmdb.org/t/p/w500' + topResult.poster_path;
                }
                if (topResult.backdrop_path) {
                    m.backdrop_url = 'https://image.tmdb.org/t/p/w1280' + topResult.backdrop_path;
                }
                console.log('Found new poster for', m.title, '->', topResult.id, topResult.poster_path);
            } else {
                console.log('No search results for', m.title);
            }
        } catch (e) {
            console.error('Search failed', m.title, e.message);
        }
    }
    fs.writeFileSync('bdcinema-data.json', JSON.stringify(db, null, 2));
    console.log('Done!');
}
run();
