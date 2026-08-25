const db = require('./db');

async function checkSchema() {
    const [cols] = await db.query('DESCRIBE lista_compras');
    console.log(cols);
    process.exit(0);
}
checkSchema();
