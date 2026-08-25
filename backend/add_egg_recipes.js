const db = require('./db');

const eggRecipes = [
    {
        nombre: "Huevos rancheros",
        categoria: "Plato Fuerte",
        tiempo: "15 min",
        imagen: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Huevos estrellados sobre tortillas de maíz fritas, cubiertos con salsa roja picante y frijoles."
    },
    {
        nombre: "Huevo estrellado",
        categoria: "Plato Fuerte",
        tiempo: "10 min",
        imagen: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Cocinar huevos a la sartén con yema tierna, sazonados con sal y pimienta negra."
    },
    {
        nombre: "Huevo en omelette",
        categoria: "Plato Fuerte",
        tiempo: "15 min",
        imagen: "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Batir huevos, doblar en la sartén con relleno de queso, jamón y pimientos finamente picados."
    },
    {
        nombre: "Huevo con chorizo",
        categoria: "Plato Fuerte",
        tiempo: "15 min",
        imagen: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Sofreír chorizo desmenuzado, agregar huevos batidos y revolver hasta cuajar."
    },
    {
        nombre: "Huevo con hotdog",
        categoria: "Plato Fuerte",
        tiempo: "15 min",
        imagen: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Saltear rodajas de salchicha de hotdog, añadir huevos revueltos y dorar al gusto."
    }
];

async function seed() {
    for (const r of eggRecipes) {
        let [cat] = await db.query('SELECT id FROM categorias WHERE nombre = ?', [r.categoria]);
        let catId = cat.length > 0 ? cat[0].id : null;
        
        let [existing] = await db.query('SELECT id FROM recetas WHERE nombre = ?', [r.nombre]);
        if (existing.length > 0) {
            await db.query('UPDATE recetas SET categoria_id = ?, tiempo = ?, imagen = ?, instrucciones = ? WHERE id = ?',
                [catId, r.tiempo, r.imagen, r.instrucciones, existing[0].id]);
            console.log(`Actualizado: ${r.nombre}`);
        } else {
            await db.query('INSERT INTO recetas (nombre, tiempo, instrucciones, imagen, categoria_id) VALUES (?, ?, ?, ?, ?)',
                [r.nombre, r.tiempo, r.instrucciones, r.imagen, catId]);
            console.log(`Insertado: ${r.nombre}`);
        }
    }
    process.exit(0);
}

seed();
