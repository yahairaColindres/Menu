const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { nombre, color } = req.body;
    try {
        const [result] = await db.query('INSERT INTO categorias (nombre, color) VALUES (?, ?)', [nombre, color || '#D81B60']);
        res.json({ id: result.insertId, nombre, color });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    const { nombre, color } = req.body;
    try {
        await db.query('UPDATE categorias SET nombre = ?, color = ? WHERE id = ?', [nombre, color, req.params.id]);
        res.json({ message: 'OK' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM categorias WHERE id = ?', [req.params.id]);
        res.json({ message: 'OK' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;