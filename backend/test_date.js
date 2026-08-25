const db = require('./db');

(async () => {
    try {
        const [rows] = await db.query("SELECT m.id, DATE_FORMAT(m.fecha, '%Y-%m-%d') as fecha, m.receta_id, r.nombre FROM menu_diario m JOIN recetas r ON m.receta_id = r.id LIMIT 5");
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error('ERROR:', e.message);
    }
    process.exit(0);
})();
