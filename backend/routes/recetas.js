const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener todas las recetas (con ingredientes)
router.get('/', async (req, res) => {
    try {
        const [recetas] = await db.query('SELECT * FROM recetas ORDER BY nombre');
        for (let receta of recetas) {
            const [ingredientes] = await db.query('SELECT id, nombre, cantidad FROM ingredientes WHERE receta_id = ?', [receta.id]);
            receta.ingredientes = ingredientes;
        }
        res.json(recetas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener una receta
router.get('/:id', async (req, res) => {
    try {
        const [recetas] = await db.query('SELECT * FROM recetas WHERE id = ?', [req.params.id]);
        if (recetas.length === 0) return res.status(404).json({ error: 'No encontrada' });
        const [ingredientes] = await db.query('SELECT id, nombre, cantidad FROM ingredientes WHERE receta_id = ?', [req.params.id]);
        recetas[0].ingredientes = ingredientes;
        res.json(recetas[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear receta (con ingredientes e imagen base64)
router.post('/', async (req, res) => {
    const { nombre, tiempo, instrucciones, imagen, categoria_id, ingredientes } = req.body;
    const parsedCategoryId = (categoria_id !== undefined && categoria_id !== null && categoria_id !== '') 
        ? parseInt(categoria_id, 10) 
        : null;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [result] = await connection.query(
            'INSERT INTO recetas (nombre, tiempo, instrucciones, imagen, categoria_id) VALUES (?, ?, ?, ?, ?)',
            [nombre, tiempo, instrucciones, imagen || null, parsedCategoryId]
        );
        const recetaId = result.insertId;
        if (ingredientes && ingredientes.length) {
            for (let ing of ingredientes) {
                await connection.query('INSERT INTO ingredientes (receta_id, nombre, cantidad) VALUES (?, ?, ?)',
                    [recetaId, ing.nombre, ing.cantidad]);
            }
        }
        await connection.commit();
        res.json({ id: recetaId });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

// Actualizar receta
router.put('/:id', async (req, res) => {
    const { nombre, tiempo, instrucciones, imagen, categoria_id, ingredientes } = req.body;
    const parsedCategoryId = (categoria_id !== undefined && categoria_id !== null && categoria_id !== '') 
        ? parseInt(categoria_id, 10) 
        : null;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query(
            'UPDATE recetas SET nombre = ?, tiempo = ?, instrucciones = ?, imagen = ?, categoria_id = ? WHERE id = ?',
            [nombre, tiempo, instrucciones, imagen || null, parsedCategoryId, req.params.id]
        );
        await connection.query('DELETE FROM ingredientes WHERE receta_id = ?', [req.params.id]);
        if (ingredientes && ingredientes.length) {
            for (let ing of ingredientes) {
                await connection.query('INSERT INTO ingredientes (receta_id, nombre, cantidad) VALUES (?, ?, ?)',
                    [req.params.id, ing.nombre, ing.cantidad]);
            }
        }
        await connection.commit();
        res.json({ message: 'OK' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM recetas WHERE id = ?', [req.params.id]);
        res.json({ message: 'OK' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;