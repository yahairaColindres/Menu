const db = require('./db');

async function cleanup() {
    try {
        console.log("Limpiando lista de compras...");

        // 1. Quitar las unidades predeterminadas '1 unidad'
        await db.query("UPDATE lista_compras SET cantidad = '' WHERE cantidad = '1 unidad'");
        
        // 2. Eliminar duplicados en la lista de compras
        const [rows] = await db.query(`
            SELECT MIN(id) as idToKeep, LOWER(TRIM(nombre)) as nombre_limpio
            FROM lista_compras
            GROUP BY LOWER(TRIM(nombre))
            HAVING COUNT(*) > 1
        `);

        for (const row of rows) {
            await db.query(
                "DELETE FROM lista_compras WHERE LOWER(TRIM(nombre)) = ? AND id != ?", 
                [row.nombre_limpio, row.idToKeep]
            );
        }

        console.log("¡Limpieza y eliminación de duplicados completada!");

    } catch (e) {
        console.error("Error al limpiar:", e);
    } finally {
        process.exit(0);
    }
}

cleanup();
