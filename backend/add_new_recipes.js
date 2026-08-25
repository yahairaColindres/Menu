const db = require('./db');

const newRecipes = [
    {
        nombre: "Tortilla española",
        categoria: "Complemento",
        tiempo: "30 min",
        imagen: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Freír papas y cebollas en rodajas finas, mezclar con huevos batidos y cuajar en la sartén por ambos lados."
    },
    {
        nombre: "Hamburguesa",
        categoria: "Plato Fuerte",
        tiempo: "20 min",
        imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Asar la tortita de carne a la parrilla, armar en pan de hamburguesa con queso, lechuga, tomate y salsas."
    },
    {
        nombre: "Hotdog",
        categoria: "Plato Fuerte",
        tiempo: "15 min",
        imagen: "https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Cocer la salchicha, servir en pan de hot dog con mostaza, ketchup, mayonesa y cebolla picada."
    },
    {
        nombre: "Sánguches",
        categoria: "Plato Fuerte",
        tiempo: "15 min",
        imagen: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Tostar pan de molde, rellenar con jamón, queso, lechuga, tomate, mayonesa y mantequilla."
    },
    {
        nombre: "Sopa de capirotada",
        categoria: "Plato Fuerte",
        tiempo: "45 min",
        imagen: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
        instrucciones: "Prepara bolitas de queso frito (capirotadas) y cocina en un rico caldo sazonado de tomates y especias."
    }
];

async function run() {
    for (const r of newRecipes) {
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
run();
