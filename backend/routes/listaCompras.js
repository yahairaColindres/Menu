const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todos los ítems
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT l.*, c.nombre as categoria_nombre, c.color as categoria_color 
            FROM lista_compras l 
            LEFT JOIN categorias c ON l.categoria_id = c.id 
            ORDER BY 
                CASE 
                    WHEN l.necesario = 1 AND l.estado != 'comprado' THEN 1
                    WHEN l.estado = 'comprado' THEN 2
                    WHEN l.estado = 'usado' THEN 3 
                    ELSE 4
                END ASC, l.id DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear
router.post('/', async (req, res) => {
    const { nombre, cantidad, categoria_id, estado, necesario } = req.body;
    try {
        const estadoFinal = estado || 'pendiente';
        const compradoFinal = estadoFinal === 'comprado' ? 1 : 0;
        const necesarioFinal = necesario ? 1 : 0;
        const [result] = await db.query(
            'INSERT INTO lista_compras (nombre, cantidad, categoria_id, estado, comprado, necesario) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, cantidad || '', categoria_id || null, estadoFinal, compradoFinal, necesarioFinal]
        );
        res.json({ id: result.insertId, nombre, cantidad, estado: estadoFinal, comprado: compradoFinal, necesario: necesarioFinal });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cambiar estado directo ('comprado', 'usado', 'pendiente')
router.patch('/:id/estado', async (req, res) => {
    const { estado } = req.body;
    if (!['comprado', 'usado', 'pendiente'].includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }
    try {
        const compradoFlag = estado === 'comprado' ? 1 : 0;
        await db.query('UPDATE lista_compras SET estado = ?, comprado = ? WHERE id = ?', [estado, compradoFlag, req.params.id]);
        res.json({ success: true, estado });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle necesario
router.patch('/:id/necesario', async (req, res) => {
    try {
        const [item] = await db.query('SELECT necesario FROM lista_compras WHERE id = ?', [req.params.id]);
        if (item.length === 0) return res.status(404).json({ error: 'No encontrado' });
        const nuevoNecesario = item[0].necesario ? 0 : 1;
        await db.query('UPDATE lista_compras SET necesario = ? WHERE id = ?', [nuevoNecesario, req.params.id]);
        res.json({ success: true, necesario: nuevoNecesario });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Toggle clásico (comprado <-> pendiente)
router.patch('/:id/toggle', async (req, res) => {
    try {
        const [item] = await db.query('SELECT estado, comprado FROM lista_compras WHERE id = ?', [req.params.id]);
        if (item.length === 0) return res.status(404).json({ error: 'No encontrado' });
        
        let nuevoEstado;
        if (item[0].estado === 'comprado') {
            nuevoEstado = 'pendiente';
        } else {
            nuevoEstado = 'comprado';
        }
        
        const compradoFlag = nuevoEstado === 'comprado' ? 1 : 0;
        await db.query('UPDATE lista_compras SET estado = ?, comprado = ? WHERE id = ?', [nuevoEstado, compradoFlag, req.params.id]);
        res.json({ success: true, estado: nuevoEstado, comprado: compradoFlag });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar ítem
router.put('/:id', async (req, res) => {
    const { nombre, cantidad, categoria_id, estado, necesario } = req.body;
    try {
        const estadoFinal = estado || 'pendiente';
        const compradoFlag = estadoFinal === 'comprado' ? 1 : 0;
        const necesarioFlag = necesario ? 1 : 0;
        await db.query('UPDATE lista_compras SET nombre = ?, cantidad = ?, categoria_id = ?, estado = ?, comprado = ?, necesario = ? WHERE id = ?',
            [nombre, cantidad, categoria_id || null, estadoFinal, compradoFlag, necesarioFlag, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM lista_compras WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Limpiar comprados
router.delete('/clear-comprados', async (req, res) => {
    try {
        await db.query("DELETE FROM lista_compras WHERE estado = 'comprado' OR comprado = 1");
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sincronizar ingredientes al aplicar una receta al menú semanal
router.post('/use-ingredientes', async (req, res) => {
    const { ingredientes } = req.body;
    if (!ingredientes || !ingredientes.length) return res.json({ success: true });
    try {
        const [catRow] = await db.query("SELECT id FROM categorias WHERE nombre = 'Vegetales' LIMIT 1");
        const defaultCatId = catRow.length > 0 ? catRow[0].id : 1;

        for (let ing of ingredientes) {
            const ingNombre = typeof ing === 'string' ? ing : ing.nombre;
            if (!ingNombre || !ingNombre.trim()) continue;
            const cleanName = ingNombre.trim();

            const [existing] = await db.query(
                "SELECT id, estado, comprado FROM lista_compras WHERE LOWER(TRIM(nombre)) = LOWER(?)",
                [cleanName]
            );

            if (existing.length === 0) {
                await db.query(
                    "INSERT INTO lista_compras (nombre, cantidad, comprado, estado, categoria_id, necesario) VALUES (?, '', 0, 'pendiente', ?, 0)",
                    [cleanName, defaultCatId]
                );
            } else {
                const item = existing[0];
                const isComprado = item.estado === 'comprado' || item.comprado === 1;
                if (isComprado) {
                    await db.query("UPDATE lista_compras SET estado = 'usado', comprado = 0 WHERE id = ?", [item.id]);
                } else {
                    await db.query("UPDATE lista_compras SET estado = 'pendiente', comprado = 0 WHERE id = ?", [item.id]);
                }
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Agregar ingredientes a la lista
router.post('/add-ingredientes', async (req, res) => {
    const { ingredientes } = req.body;
    if (!ingredientes || !ingredientes.length) return res.json({ success: true });
    try {
        const [catRow] = await db.query("SELECT id FROM categorias WHERE nombre = 'Vegetales' LIMIT 1");
        const defaultCatId = catRow.length > 0 ? catRow[0].id : 1;

        for (let ing of ingredientes) {
            const ingNombre = typeof ing === 'string' ? ing : ing.nombre;
            if (!ingNombre || !ingNombre.trim()) continue;
            const cleanName = ingNombre.trim();

            const [existing] = await db.query(
                "SELECT id FROM lista_compras WHERE LOWER(TRIM(nombre)) = LOWER(?)",
                [cleanName]
            );

            if (existing.length === 0) {
                await db.query(
                    "INSERT INTO lista_compras (nombre, cantidad, comprado, estado, categoria_id, necesario) VALUES (?, '', 0, 'pendiente', ?, 0)",
                    [cleanName, defaultCatId]
                );
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;