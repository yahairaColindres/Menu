const express = require('express');
const router = express.Router();
const db = require('../db');

// Obtener menú por rango de fechas (ej: ?start=2025-01-01&end=2025-01-07)
router.get('/', async (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) {
        return res.status(400).json({ error: 'Se requiere start y end' });
    }
    try {
        const [rows] = await db.query(
            `SELECT m.id, DATE_FORMAT(m.fecha, '%Y-%m-%d') as fecha, m.receta_id, r.nombre as receta_nombre, r.imagen, r.tiempo, c.nombre as categoria_nombre 
       FROM menu_diario m 
       JOIN recetas r ON m.receta_id = r.id 
       LEFT JOIN categorias c ON r.categoria_id = c.id 
       WHERE m.fecha BETWEEN ? AND ?`,
            [start, end]
        );
        // Agrupar por fecha (formato YYYY-MM-DD limpio)
        const menuMap = {};
        rows.forEach(row => {
            const fechaKey = row.fecha; // ya viene como '2026-08-03' gracias a DATE_FORMAT
            if (!menuMap[fechaKey]) menuMap[fechaKey] = [];
            menuMap[fechaKey].push(row);
        });
        res.json(menuMap);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Asignar receta a una fecha (REEMPLAZA la receta anterior del mismo tipo en ese día)
router.post('/', async (req, res) => {
    const { fecha, receta_id } = req.body;
    if (!fecha || !receta_id) {
        return res.status(400).json({ error: 'fecha y receta_id requeridos' });
    }
    try {
        // Obtener la categoría de la receta que se quiere agregar
        const [recetaInfo] = await db.query(
            `SELECT r.categoria_id, c.nombre as categoria_nombre 
             FROM recetas r LEFT JOIN categorias c ON r.categoria_id = c.id 
             WHERE r.id = ?`, [receta_id]
        );
        
        const esBebe = recetaInfo.length > 0 && recetaInfo[0].categoria_nombre === 'Menú Bebé';
        
        if (esBebe) {
            // Para Menú Bebé: reemplazar solo la entrada bebé de ese día
            await db.query(
                `DELETE FROM menu_diario WHERE fecha = ? AND receta_id IN (
                    SELECT r.id FROM recetas r JOIN categorias c ON r.categoria_id = c.id WHERE c.nombre = 'Menú Bebé'
                )`, [fecha]
            );
        } else {
            // Para menú principal: reemplazar todas las entradas NO-bebé de ese día
            await db.query(
                `DELETE FROM menu_diario WHERE fecha = ? AND receta_id NOT IN (
                    SELECT r.id FROM recetas r JOIN categorias c ON r.categoria_id = c.id WHERE c.nombre = 'Menú Bebé'
                )`, [fecha]
            );
        }
        
        const [result] = await db.query('INSERT INTO menu_diario (fecha, receta_id) VALUES (?, ?)', [fecha, receta_id]);
        res.json({ id: result.insertId, fecha, receta_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar una entrada
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM menu_diario WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Limpiar un día completo
router.delete('/day/:fecha', async (req, res) => {
    try {
        await db.query('DELETE FROM menu_diario WHERE fecha = ?', [req.params.fecha]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Limpiar todo (con opción de fechas)
router.delete('/clear-all', async (req, res) => {
    try {
        await db.query('DELETE FROM menu_diario');
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;