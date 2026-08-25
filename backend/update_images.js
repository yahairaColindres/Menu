const db = require('./db');

const imagesMap = [
    { id: 16, nombre: "Albóndigas de carne molida con salsa roja", imagen: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80" },
    { id: 18, nombre: "Armahón hondureño (tortilla rellena)", imagen: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=800&q=80" },
    { id: 5,  nombre: "Arroz con Pollo", imagen: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=800&q=80" },
    { id: 8,  nombre: "Canelones con carne de res", imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80" },
    { id: 9,  nombre: "Cordon Blue", imagen: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=800&q=80" },
    { id: 11, nombre: "Enchiladas hondureñas", imagen: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80" },
    { id: 4,  nombre: "Ensalada César", imagen: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80" },
    { id: 17, nombre: "Espaguetis blancos (salsa cremosa)", imagen: "https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=800&q=80" },
    { id: 10, nombre: "Espaguetis con salsa bolognesa", imagen: "https://images.unsplash.com/photo-1622973536968-3ead9e780960?auto=format&fit=crop&w=800&q=80" },
    { id: 3,  nombre: "Lasaña", imagen: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80" },
    { id: 20, nombre: "Momias de pollo enrolladas con tocino", imagen: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80" },
    { id: 15, nombre: "Nachos con chili", imagen: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80" },
    { id: 14, nombre: "Papa al horno", imagen: "https://images.unsplash.com/photo-1600289031464-68d1740d24eb?auto=format&fit=crop&w=800&q=80" },
    { id: 6,  nombre: "Pastel de Chocolate", imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80" },
    { id: 2,  nombre: "Pollo Asado", imagen: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80" },
    { id: 19, nombre: "Pollo asado al horno con especias", imagen: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=800&q=80" },
    { id: 1,  nombre: "Pollo Guisado", imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80" },
    { id: 12, nombre: "Sopa de tortilla", imagen: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80" },
    { id: 7,  nombre: "Tacos de Carne", imagen: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80" },
    { id: 13, nombre: "Tacos hondureños", imagen: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=800&q=80" }
];

async function updateImages() {
    try {
        console.log("Iniciando actualización de imágenes...");
        for (const item of imagesMap) {
            const [result] = await db.query(
                'UPDATE recetas SET imagen = ? WHERE id = ?',
                [item.imagen, item.id]
            );
            console.log(`Receta ID ${item.id} (${item.nombre}): ${result.affectedRows} fila(s) actualizada(s)`);
        }
        console.log("¡Actualización completada exitosamente!");
        process.exit(0);
    } catch (err) {
        console.error("Error al actualizar imágenes:", err);
        process.exit(1);
    }
}

updateImages();
