import { Client } from '@neondatabase/serverless';

async function test(url) {
    const client = new Client({ connectionString: url });
    try {
        await client.connect();
        console.log('SUCCESS:', url.split('@')[1]);
        await client.end();
    } catch (e) {
        console.error('FAILED:', url.split('@')[1], e.message);
    }
}

async function main() {
    await test('postgresql://neondb_owner:npg_0lhALWGEUDp3@ep-curly-rice-a1kqd8hu-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');
    await test('postgresql://neondb_owner:npg_co4OFkpM3Kye@ep-cold-breeze-ailiw5vy-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require');
}

main();
