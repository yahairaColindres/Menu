const db = require('./db');

async function updateSchema() {
    try {
        const [cols] = await db.query('DESCRIBE lista_compras');
        const hasEstado = cols.some(c => c.Field === 'estado');
        if (!hasEstado) {
            await db.query("ALTER TABLE lista_compras ADD COLUMN estado VARCHAR(20) DEFAULT 'pendiente'");
            console.log("Columna 'estado' añadida a lista_compras.");
        }
        
        // Sincronizar datos existentes: si comprado = 1 => 'comprado', sino 'pendiente'
        await db.query("UPDATE lista_compras SET estado = 'comprado' WHERE comprado = 1 AND (estado IS NULL OR estado = 'pendiente')");
        await db.query("UPDATE lista_compras SET estado = 'pendiente' WHERE (comprado = 0 OR comprado IS NULL) AND estado IS NULL");
        
        console.log("Esquema actualizado correctamente.");
        process.exit(0);
    } catch (err) {
        console.error("Error al actualizar esquema:", err);
        process.exit(1);
    }
}
updateSchema();
