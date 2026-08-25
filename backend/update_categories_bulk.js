const db = require('./db');

/**
 * Script definitivo de reclasificación de ingredientes
 * Basado en la lista real de la base de datos.
 */

async function reclasificar() {
    try {
        // === 1. Obtener mapa de categorías ===
        const [cats] = await db.query('SELECT id, nombre FROM categorias');
        const catMap = {};
        cats.forEach(c => { catMap[c.nombre] = c.id; });

        console.log('Categorías en DB:');
        Object.entries(catMap).forEach(([n, id]) => console.log(`  ${id}: ${n}`));

        const getCatId = (nombre) => {
            if (!catMap[nombre]) throw new Error(`Categoría no existe: "${nombre}"`);
            return catMap[nombre];
        };

        // === 2. Reclasificaciones por nombre exacto ===
        // Formato: { nombre_ingrediente: 'Nombre Categoría Destino' }
        const porNombreExacto = {
            // --- SIN CATEGORÍA → CARNES ---
            'Camarones empanizados':    'Carnes y Mariscos',
            'Carne estofado':           'Carnes y Mariscos',
            'Chorizo casero':           'Carnes y Mariscos',
            'Chorizo parrillero':       'Carnes y Mariscos',
            'Chuleta':                  'Carnes y Mariscos',
            'Embutidos':                'Carnes y Mariscos',
            'Fajitas de res':           'Carnes y Mariscos',
            'Filete':                   'Carnes y Mariscos',
            'Hígado':                   'Carnes y Mariscos',
            'Hotdog':                   'Carnes y Mariscos',
            'Jamón':                    'Carnes y Mariscos',
            'Medallones':               'Carnes y Mariscos',
            'Menudos':                  'Carnes y Mariscos',
            'Mortadela':                'Carnes y Mariscos',
            'Pechuga deshuesada':       'Carnes y Mariscos',
            'Pescado':                  'Carnes y Mariscos',
            'Pollo entero':             'Carnes y Mariscos',
            'Pollo muslo':              'Carnes y Mariscos',
            'Sardina':                  'Carnes y Mariscos',
            'Tocino':                   'Carnes y Mariscos',
            'Tortitas para hamburguesa':'Carnes y Mariscos',

            // --- SIN CATEGORÍA → LÁCTEOS ---
            'Huevo':                    'Lácteos y Huevos',
            'Leche':                    'Lácteos y Huevos',
            'Malteada':                 'Lácteos y Huevos',
            'Quesillo':                 'Lácteos y Huevos',
            'Queso amarillo':           'Lácteos y Huevos',
            'Queso amarillo líquido':   'Lácteos y Huevos',
            'Queso fresco':             'Lácteos y Huevos',
            'Yogurt':                   'Lácteos y Huevos',

            // --- SIN CATEGORÍA → VEGETALES ---
            'Chile dulce':              'Verduras y Frutas',
            'Coliflor':                 'Verduras y Frutas',
            'Culantro':                 'Verduras y Frutas',
            'Escarola':                 'Verduras y Frutas',
            'Limones':                  'Verduras y Frutas',
            'Mínimo verde':             'Verduras y Frutas',
            'Papas':                    'Verduras y Frutas',
            'Pepino':                   'Verduras y Frutas',
            'Piña':                     'Verduras y Frutas',
            'Plátanos':                 'Verduras y Frutas',
            'Rábanos':                  'Verduras y Frutas',
            'Remolacha':                'Verduras y Frutas',
            'Repollo':                  'Verduras y Frutas',
            'Sandía':                   'Verduras y Frutas',
            'Tomates':                  'Verduras y Frutas',
            'Mandarina':                'Verduras y Frutas',
            'Mango':                    'Verduras y Frutas',
            'Mora':                     'Verduras y Frutas',
            'Mínimo':                   'Verduras y Frutas',

            // --- SIN CATEGORÍA → LIMPIEZA ---
            'Cepillo de baño':          'Limpieza e Higiene',
            'Cloro':                    'Limpieza e Higiene',
            'Encendedor cocina':        'Limpieza e Higiene',
            'Jabón de baño':            'Limpieza e Higiene',
            'Jabón de lavar pepes':     'Limpieza e Higiene',
            'Jabón líquido lavar ropa': 'Limpieza e Higiene',
            'Jabón platos':             'Limpieza e Higiene',
            'Limpiador de cocina Mr. Músculo': 'Limpieza e Higiene',
            'Limpiador de ventanas':    'Limpieza e Higiene',
            'Líquido rojo para muebles':'Limpieza e Higiene',
            'Paño absorbente':          'Limpieza e Higiene',
            'Paste para bañar':         'Limpieza e Higiene',
            'Pastes para platos':       'Limpieza e Higiene',
            'Pato lava inodoro':        'Limpieza e Higiene',
            'Piedra pómez':             'Limpieza e Higiene',
            'Suavitel':                 'Limpieza e Higiene',
            'Trapos de cocina':         'Limpieza e Higiene',

            // --- SIN CATEGORÍA → CONDIMENTOS ---
            'Margarina':                'Especies y Condimentos',
            'Nuez moscada':             'Especies y Condimentos',
            'Orégano':                  'Especies y Condimentos',
            'Pimienta':                 'Especies y Condimentos',
            'Pimienta negra':           'Especies y Condimentos',
            'Sal':                      'Especies y Condimentos',
            'Naranja agria':            'Verduras y Frutas',

            // --- SIN CATEGORÍA → CARBOHIDRATOS ---
            'Champiñones en lata':      'Carbohidratos',
            'Lentejas':                 'Carbohidratos',
            'Nachos':                   'Carbohidratos',

            // --- MAL CLASIFICADOS → CORREGIR ---
            'Estropajo':                'Limpieza e Higiene',   // estaba en Condimentos
            'Sal Andrews':              'Medicina',              // es medicina, no condimento
            'Palillos para dientes':    'Limpieza e Higiene',   // estaba en Condimentos
            'Soyas':                    'Snacks',                // volver a Snacks
            'Frijolitos verdes':        'Verduras y Frutas',     // es vegetal
            'Leche de coco':            'Bebidas',              // es bebida/condimento - bebidas

            // --- FRUTAS SIN CATEGORÍA ---
            'Esencia de vainilla':      'Repostería',
            'Polvo de hornear':         'Repostería',
        };

        // === 3. Aplicar cambios ===
        let ok = 0, skip = 0, notFound = 0;

        for (const [nombre, catDestino] of Object.entries(porNombreExacto)) {
            const catId = catMap[catDestino];
            if (!catId) {
                console.warn(`  ⚠ Categoría destino no existe: "${catDestino}"`);
                continue;
            }

            const [rows] = await db.query(
                'SELECT id, categoria_id FROM lista_compras WHERE nombre = ?', [nombre]
            );

            if (rows.length === 0) {
                console.log(`  ○ No encontrado: "${nombre}"`);
                notFound++;
                continue;
            }

            for (const row of rows) {
                if (row.categoria_id === catId) {
                    skip++;
                    continue;
                }
                await db.query(
                    'UPDATE lista_compras SET categoria_id = ? WHERE id = ?',
                    [catId, row.id]
                );
                console.log(`  ✔ "${nombre}" → ${catDestino}`);
                ok++;
            }
        }

        // === 4. Actualizar categoría "Verduras y Frutas" a incluir todas las frutas que quedaron sin categoría ===
        // Ingredientes con categorías de origen compuesto que la usuaria quiere consolidar
        // (ya están bien en Verduras y Frutas que es la categoría vegetal de esta DB)

        console.log(`\n✅ Listo: ${ok} actualizados, ${skip} ya estaban bien, ${notFound} no encontrados.`);
        process.exit(0);

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

reclasificar();
