import fs from 'fs';

async function run() {
    const envFile = fs.readFileSync('.env.local', 'utf8');
    const keyMatch = envFile.match(/TMDB_API_KEY=(.*)/);
    const key = keyMatch ? keyMatch[1] : null;

    if (!key) throw new Error('No API key found in .env.local');

    const db = JSON.parse(fs.readFileSync('bdcinema-data.json', 'utf8'));

    for (let m of db.movies) {
        if (!m.tmdb_id) continue;
        try {
            const url = `https://api.themoviedb.org/3/${m.type === 'series' ? 'tv' : 'movie'}/${m.tmdb_id}?api_key=${key.trim()}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.poster_path) {
                m.poster_url = 'https://image.tmdb.org/t/p/w500' + data.poster_path;
            } else {
                console.log(m.title, 'No poster path in TMDB response');
            }
            if (data.backdrop_path) {
                m.backdrop_url = 'https://image.tmdb.org/t/p/w1280' + data.backdrop_path;
            }
            console.log(m.title, 'poster:', data.poster_path);
        } catch (e) {
            console.error('Failed', m.title, e.message);
        }
    }
    fs.writeFileSync('bdcinema-data.json', JSON.stringify(db, null, 2));
    console.log('Done!');
}
run();
