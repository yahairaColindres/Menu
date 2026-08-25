const db = require('./db');

async function updateIngredients() {
    try {
        console.log("Actualizando ingredientes y lista de compras...");
        
        const updates = [
            // Aceite para freír -> Aceite vegetal
            { oldLike: '%aceite para freir%', new: 'Aceite vegetal' },
            { oldLike: '%aceite para freír%', new: 'Aceite vegetal' },
            // Ajo picado -> Ajo
            { old: 'ajo picado', new: 'Ajo' },
            { old: 'Ajo picado', new: 'Ajo' },
            // Cacao en polvo -> Chocolate
            { oldLike: '%cacao en polvo%', new: 'Chocolate' },
            // Carne molida de res cocido -> Carne molida
            { oldLike: '%carne molida de res cocido%', new: 'Carne molida' },
            { oldLike: '%carne molida de res%', new: 'Carne molida' },
            // Cebolla picada -> Cebolla
            { oldLike: '%cebolla picada%', new: 'Cebolla' },
            // Chile dulce o jalapeño -> Chile dulce
            { oldLike: '%chile dulce o jalapeño%', new: 'Chile dulce' },
            // Cilantro / Cilantro fresco -> Culantro
            { old: 'cilantro', new: 'Culantro' },
            { old: 'Cilantro', new: 'Culantro' },
            { old: 'cilantro fresco', new: 'Culantro' },
            { old: 'Cilantro fresco', new: 'Culantro' }
        ];

        for (let u of updates) {
            if (u.old) {
                await db.query("UPDATE ingredientes SET nombre = ? WHERE nombre = ?", [u.new, u.old]);
                await db.query("UPDATE lista_compras SET nombre = ? WHERE nombre = ?", [u.new, u.old]);
            }
            if (u.oldLike) {
                await db.query("UPDATE ingredientes SET nombre = ? WHERE nombre LIKE ?", [u.new, u.oldLike]);
                await db.query("UPDATE lista_compras SET nombre = ? WHERE nombre LIKE ?", [u.new, u.oldLike]);
            }
        }

        const deletes = [
            '%anchoas%',
            '%caldo de carne%',
            '%caldo de pollo%',
            '%chile guaijillo%',
            '%chile guajillo%'
        ];

        for (let d of deletes) {
            await db.query("DELETE FROM ingredientes WHERE nombre LIKE ?", [d]);
            await db.query("DELETE FROM lista_compras WHERE nombre LIKE ?", [d]);
        }
        
        console.log("¡Actualizaciones completadas!");
    } catch (e) {
        console.error("Error", e);
    } finally {
        process.exit(0);
    }
}

updateIngredients();
