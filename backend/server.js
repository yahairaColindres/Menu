const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// CORS: en producción solo permite el dominio Railway; en local permite todo
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.RAILWAY_PUBLIC_DOMAIN ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : null].filter(Boolean)
    : true; // true = permite cualquier origen en desarrollo

app.use(cors(allowedOrigins === true ? undefined : { origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check para Railway
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Importar rutas
const categoriasRoutes = require('./routes/categorias');
const recetasRoutes = require('./routes/recetas');
const listaComprasRoutes = require('./routes/listaCompras.js');
const menuDiarioRoutes = require('./routes/menuDiario');

app.use('/api/categorias', categoriasRoutes);
app.use('/api/recetas', recetasRoutes);
app.use('/api/lista-compras', listaComprasRoutes);
app.use('/api/menu-diario', menuDiarioRoutes);

// Servir frontend en producción si existe la carpeta compilada dist
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(frontendDist, 'index.html'));
        }
    });
}

const PORT = process.env.PORT || 7001;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));