const db = require('./db');
const fs = require('fs');

async function dump() {
    try {
        let sql = '-- Dump de base de datos Menu Compras\nCREATE DATABASE IF NOT EXISTS `menu_compras`;\nUSE `menu_compras`;\n\n';
        const tables = ['categorias', 'recetas', 'ingredientes', 'lista_compras', 'menu_diario'];
        
        for (const table of tables) {
            const [create] = await db.query(`SHOW CREATE TABLE \`${table}\``);
            sql += `DROP TABLE IF EXISTS \`${table}\`;\n`;
            sql += `${create[0]['Create Table']};\n\n`;
            
            const [rows] = await db.query(`SELECT * FROM \`${table}\``);
            if (rows.length > 0) {
                for (const row of rows) {
                    const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
                    const values = Object.values(row).map(v => {
                        if (v === null) return 'NULL';
                        if (typeof v === 'number') return v;
                        if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        const escaped = String(v)
                            .replace(/\\/g, '\\\\')
                            .replace(/'/g, "\\'")
                            .replace(/\n/g, '\\n')
                            .replace(/\r/g, '\\r');
                        return `'${escaped}'`;
                    }).join(', ');
                    sql += `INSERT INTO \`${table}\` (${keys}) VALUES (${values});\n`;
                }
                sql += '\n';
            }
        }
        fs.writeFileSync('./database_dump.sql', sql);
        console.log(`✅ Dump completado con éxito: database_dump.sql creado (${(sql.length / 1024).toFixed(2)} KB)`);
        process.exit(0);
    } catch (err) {
        console.error('Error creando dump:', err);
        process.exit(1);
    }
}

dump();
