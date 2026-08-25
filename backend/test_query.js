const db = require('./db');

async function test() {
    const [rows] = await db.query('SELECT id, nombre, imagen FROM recetas');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
}
test();
