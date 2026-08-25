const db = require('./db');

const categories = [
    { nombre: "Menú Bebé", color: "#42A5F5" }
];

const newRecipes = [
    {
        nombre: "Tortillas con quesillo",
        categoria: "Plato Fuerte",
        tiempo: "15 min",
        imagen: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Calentar tortillas de maíz con abundante quesillo fundido en medio hasta que se derrita."
    },
    {
        nombre: "Panqueques",
        categoria: "Plato Fuerte",
        tiempo: "20 min",
        imagen: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Mezclar harina, leche, huevo y mantequilla. Cocinar discos en la sartén y servir con miel."
    },
    {
        nombre: "Baleadas",
        categoria: "Plato Fuerte",
        tiempo: "20 min",
        imagen: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Tortilla de harina recién hecha rellena de frijoles fritos, mantequilla y queso duro rallado."
    },
    {
        nombre: "Puré de verduras para bebé",
        categoria: "Menú Bebé",
        tiempo: "25 min",
        imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Cocer zanahoria, papa y ayote al vapor. Procesar fino hasta lograr una textura suave."
    },
    {
        nombre: "Papilla de manzana y banano",
        categoria: "Menú Bebé",
        tiempo: "15 min",
        imagen: "https://images.unsplash.com/photo-1568899466260-b6d4e56e8e42?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Cocer manzana al vapor y triturar junto con banano maduro fresco."
    },
    {
        nombre: "Colado de verduras y pollo",
        categoria: "Menú Bebé",
        tiempo: "30 min",
        imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Hervir pechuga de pollo con papa, zanahoria y apio. Licuar homogéneo para bebé."
    },
    {
        nombre: "Papilla de avena y pera",
        categoria: "Menú Bebé",
        tiempo: "15 min",
        imagen: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Cocer avena en agua con trozos de pera hasta que esté muy tierna y triturar."
    }
];

async function seed() {
    for (const c of categories) {
        let [rows] = await db.query('SELECT id FROM categorias WHERE nombre = ?', [c.nombre]);
        if (rows.length === 0) {
            await db.query('INSERT INTO categorias (nombre, color) VALUES (?, ?)', [c.nombre, c.color]);
            console.log(`Categoría agregada: ${c.nombre}`);
        }
    }

    for (const r of newRecipes) {
        let [cat] = await db.query('SELECT id FROM categorias WHERE nombre = ?', [r.categoria]);
        let catId = cat.length > 0 ? cat[0].id : null;
        
        let [existing] = await db.query('SELECT id FROM recetas WHERE nombre = ?', [r.nombre]);
        if (existing.length > 0) {
            await db.query('UPDATE recetas SET categoria_id = ?, tiempo = ?, imagen = ?, instrucciones = ? WHERE id = ?',
                [catId, r.tiempo, r.imagen, r.instrucciones, existing[0].id]);
            console.log(`Actualizada receta: ${r.nombre}`);
        } else {
            await db.query('INSERT INTO recetas (nombre, tiempo, instrucciones, imagen, categoria_id) VALUES (?, ?, ?, ?, ?)',
                [r.nombre, r.tiempo, r.instrucciones, r.imagen, catId]);
            console.log(`Insertada receta: ${r.nombre}`);
        }
    }
    process.exit(0);
}

seed();
