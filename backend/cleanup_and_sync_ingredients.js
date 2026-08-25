const db = require('./db');

async function cleanAndSync() {
    console.log("=== 1. ELIMINANDO DUPLICADOS EN LISTA DE COMPRAS ===");
    
    // Obtener todos los productos
    const [items] = await db.query('SELECT * FROM lista_compras ORDER BY id ASC');
    const seen = new Map();
    const toDelete = [];

    for (const item of items) {
        const key = item.nombre.trim().toLowerCase();
        if (seen.has(key)) {
            toDelete.push(item.id);
        } else {
            seen.set(key, item.id);
        }
    }

    if (toDelete.length > 0) {
        await db.query(`DELETE FROM lista_compras WHERE id IN (${toDelete.join(',')})`);
        console.log(`Se eliminaron ${toDelete.length} ítems duplicados de la lista de compras.`);
    } else {
        console.log("No se encontraron duplicados.");
    }

    console.log("=== 2. SINCRONIZANDO INGREDIENTES DE TODAS LAS RECETAS CON LA LISTA DE COMPRAS ===");

    // Obtener todos los ingredientes de recetas
    const [recipeIngs] = await db.query('SELECT DISTINCT TRIM(nombre) as nombre FROM ingredientes WHERE nombre IS NOT NULL AND nombre != ""');
    const [catVegetales] = await db.query('SELECT id FROM categorias WHERE nombre = "Vegetales" OR nombre = "Carnes" LIMIT 1');
    const defaultCatId = catVegetales.length > 0 ? catVegetales[0].id : 1;

    let addedCount = 0;
    for (const ing of recipeIngs) {
        const nameClean = ing.nombre.trim();
        const key = nameClean.toLowerCase();
        
        const [existing] = await db.query('SELECT id FROM lista_compras WHERE LOWER(TRIM(nombre)) = ?', [key]);
        if (existing.length === 0) {
            await db.query('INSERT INTO lista_compras (nombre, cantidad, comprado, estado, categoria_id) VALUES (?, ?, 0, "pendiente", ?)',
                [nameClean, '1 unidad', defaultCatId]);
            addedCount++;
        }
    }

    console.log(`Se agregaron ${addedCount} nuevos ingredientes de recetas a la Lista de Compras en estado Pendiente (🔴).`);
    process.exit(0);
}

cleanAndSync().catch(err => {
    console.error(err);
    process.exit(1);
});
