const db = require('./db');

/**
 * Elimina duplicados de lista_compras conservando el registro con ID más bajo.
 */
async function eliminarDuplicados() {
    try {
        // 1. Encontrar duplicados (mismo nombre, case-insensitive)
        const [duplicados] = await db.query(`
            SELECT MIN(nombre) AS nombre, COUNT(*) AS total, MIN(id) AS id_conservar
            FROM lista_compras
            GROUP BY LOWER(TRIM(nombre))
            HAVING COUNT(*) > 1
            ORDER BY MIN(nombre)
        `);

        if (duplicados.length === 0) {
            console.log('✅ No se encontraron duplicados.');
            process.exit(0);
        }

        console.log(`Encontrados ${duplicados.length} grupos con duplicados:\n`);

        let totalEliminados = 0;

        for (const dup of duplicados) {
            // Obtener todos los IDs del grupo
            const [filas] = await db.query(`
                SELECT id, nombre, categoria_id FROM lista_compras
                WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))
                ORDER BY id ASC
            `, [dup.nombre]);

            const conservar = filas[0];
            const eliminar = filas.slice(1);

            console.log(`  "${conservar.nombre}" (${filas.length} copias) → conservar ID ${conservar.id}, eliminar IDs: ${eliminar.map(f => f.id).join(', ')}`);

            for (const f of eliminar) {
                await db.query('DELETE FROM lista_compras WHERE id = ?', [f.id]);
                totalEliminados++;
            }
        }

        console.log(`\n✅ Listo. ${totalEliminados} duplicados eliminados.`);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

eliminarDuplicados();
