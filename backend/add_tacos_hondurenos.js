const db = require('./db');

async function addRecipe() {
    try {
        console.log("Agregando Tacos de Maíz Hondureños...");

        const receta = {
            nombre: "Tacos de Maíz Hondureños (Flautas)",
            categoria: "Plato Fuerte",
            tiempo: "45 min",
            imagen: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=800&q=80", // Imagen aproximada de tacos fritos
            instrucciones: "1. Cocinar la carne molida o desmenuzar el pollo cocido sazonado.\n2. Calentar ligeramente las tortillas de maíz para que no se rompan.\n3. Rellenar las tortillas con la carne, enrollarlas firmemente (asegurar con un palillo si es necesario).\n4. Freír en aceite vegetal caliente hasta que estén dorados y crujientes.\n5. Servir cubiertos con repollo picado, salsa de tomate hondureña, y queso duro rallado."
        };

        const ingredientes = [
            { nombre: "Tortillas de maíz", cantidad: "1 paquete" },
            { nombre: "Carne molida o pollo", cantidad: "1 lb" },
            { nombre: "Repollo", cantidad: "1/2 unidad" },
            { nombre: "Salsa de tomate", cantidad: "1 taza" },
            { nombre: "Queso duro rallado", cantidad: "1/2 taza" },
            { nombre: "Aceite vegetal", cantidad: "para freír" }
        ];

        // Obtener ID de la categoría
        let [cat] = await db.query('SELECT id FROM categorias WHERE nombre = ?', [receta.categoria]);
        let catId = cat.length > 0 ? cat[0].id : null;

        if (!catId) {
            const [insertCat] = await db.query('INSERT INTO categorias (nombre, color) VALUES (?, ?)', [receta.categoria, '#FFB74D']);
            catId = insertCat.insertId;
        }

        // Insertar receta
        const [result] = await db.query('INSERT INTO recetas (nombre, tiempo, instrucciones, imagen, categoria_id) VALUES (?, ?, ?, ?, ?)',
            [receta.nombre, receta.tiempo, receta.instrucciones, receta.imagen, catId]);
        
        const recetaId = result.insertId;

        // Insertar ingredientes
        for (let ing of ingredientes) {
            await db.query('INSERT INTO ingredientes (receta_id, nombre, cantidad) VALUES (?, ?, ?)',
                [recetaId, ing.nombre, ing.cantidad]);
        }

        console.log("¡Receta de Tacos de Maíz Hondureños agregada con éxito!");

    } catch (e) {
        console.error("Error al agregar receta:", e);
    } finally {
        process.exit(0);
    }
}

addRecipe();
