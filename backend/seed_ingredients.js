const db = require('./db');

const data = {
    "Vegetales": [
        "Repollo", "Pepino", "Culantro", "Mínimo verde", "Coliflor", "Chile dulce", 
        "Remolacha", "Plátanos", "Limones", "Tomate", "Apio", "Lechuga", 
        "Escarola", "Zanahoria", "Papa", "Cebolla", "Brócoli", "Aguacate", 
        "Ajo", "Jengibre", "Frijolitos verdes", "Rábanos"
    ],
    "Bebidas": [
        "Jugos de naranja", "Café", "Manzanilla", "Té Lipton en polvo", "Horchata", 
        "Chocolate", "Malteadas", "Cremitas", "Refrescos", "Gatorade"
    ],
    "Frutas": [
        "Manzana", "Mínimo", "Mango", "Naranja", "Piña", "Mandarina", "Mora", "Sandía"
    ],
    "Carnes": [
        "Pescado", "Filete", "Bistec", "Pechuga deshuesada", "Pollo muslo", "Fajitas de res", 
        "Embutidos", "Menudos", "Camarones empanizados", "Alitas empanizadas", "Jamón", 
        "Mortadela", "Tocino", "Carne estofado", "Hígado", "Sardina", "Atún", 
        "Chorizo parrillero", "Chorizo casero", "Carne molida", "Medallones", 
        "Camarón", "Chuleta", "Tortitas para hamburguesa", "Hotdog"
    ],
    "Lácteos": [
        "Huevos", "Quesillo", "Queso fresco", "Queso semi seco", "Queso amarillo", 
        "Queso amarillo líquido", "Leche", "Malteada", "Mantequilla", "Yogurt", "Queso mozzarella"
    ],
    "Snacks": [
        "Galleta", "Soyas", "Churro", "Gelatina", "Flan", "Palomitas", "Miel", "Pasas", "Chocobanano"
    ],
    "Carbohidratos": [
        "Pan de hot dog", "Arroz", "Tajaditas tostadas", "Arroz blanco", "Arroz precocido", 
        "Tortillas tostadas", "Avena", "Azúcar", "Cereal", "Canelones", "Panqueques", 
        "Harina", "Lasagna", "Marmahón", "Aceite", "Pan molde", "Sopas instantáneas", 
        "Papas congeladas", "Tallarines", "Espagueti", "Coditos", "Maseca", 
        "Maicito en latas", "Maíz normal bandeja", "Hongos en lata", "Tortillas de harina", 
        "Harina para pastelitos", "Churro para nachos", "Pan de hamburguesa"
    ],
    "Especies y Condimentos": [
        "Sal", "Mojo", "Salsa barbacoa", "Salsa inglesa", "Salsa soya", "Especies para carne", 
        "Cominos", "Curry", "Ablandadores", "Consomé de camarón", "Consomé de res", 
        "Consomé de vaca", "Mayonesa", "Mayonesa anaranjada", "Margarina", "Salsa ketchup", 
        "Salsa pasta", "Salsa criolla", "Vinagre", "Aderezo salsa alfredo", "Aderezo italiano", 
        "Honey mustard", "Salsa de ostra", "Canela en polvo", "Canela en rajas", 
        "Cubitos de pollo", "Cubitos de vaca", "Achiote", "Salsa de ajo", "Mostaza", 
        "Sopa Maggi tortilla", "Sopa Maggi crema de pollo", "Sopa Maggi costilla/pollo", 
        "Leche de coco", "Empanizador", "Palillos para dientes", "Mayonesa para ensalada"
    ],
    "Limpieza": [
        "Trapos de cocina", "Cepillo de baño", "Piedra pómez", "Suavitel", "Ace", 
        "Jabón de lavar pepes", "Jabón para lavarse las manos", "Papel higiénico", "Cloro", 
        "Pato lava inodoro", "Jabón de baño", "Jabón platos", "Líquido rojo para muebles", 
        "Jabón líquido lavar ropa", "Bolsas charamuscas", "Bolsa para frijoles", "Aromatizantes", 
        "Bolsas medianas basurero baño", "Bolsas pequeñas", "Bolsas jardín para basurero de afuera", 
        "Paste para bañar", "Pastes para platos", "Encendedor cocina", "Limpiador de ventanas", 
        "Limpiador de cocina Mr. Músculo", "Bicarbonato", "Paño absorbente"
    ],
    "Belleza": [
        "Algodón uñas", "Shampoo Yaha", "Shampoo Kevin", "Rasuradora Yaha", "Rasuradora Kevin", 
        "Desodorante Kevin", "Desodorante Yaha", "Pasta dental", "Agua micelar", 
        "Cepillo dental", "Hilo dental", "Enjuague bucal"
    ],
    "Bebé": [
        "Toallitas húmedas", "Pañales", "Shampoo bebé", "Jabón bebé", "Crema bebé", 
        "Leche bebé", "Gerber bebé", "Frutas bebé", "Talco bebé", "Pasta bebé", "Cepillo bebé"
    ],
    "Desechables": [
        "Platos grandes", "Platos pequeños", "Cucharitas", "Tenedores", "Polipel", 
        "Papel aluminio", "Papel toalla", "Servilletas"
    ],
    "Medicina": [
        "Pepto-Bismol", "Curitas", "Ibuprofeno", "Sudagrip", "Sal Andrews", 
        "Tapsin gripe y tos", "Panadol extra fuerte", "Alcohol"
    ],
    "Repostería": [
        "Fermipan", "Grenetina", "Vainilla"
    ]
};

const categoryColors = {
    "Vegetales": "#2E7D32",
    "Bebidas": "#0288D1",
    "Frutas": "#F57C00",
    "Carnes": "#C62828",
    "Lácteos": "#FBC02D",
    "Snacks": "#8E24AA",
    "Carbohidratos": "#6D4C41",
    "Especies y Condimentos": "#D81B60",
    "Limpieza": "#009688",
    "Belleza": "#EC407A",
    "Bebé": "#42A5F5",
    "Desechables": "#78909C",
    "Medicina": "#5C6BC0",
    "Repostería": "#AB47BC"
};

async function seed() {
    try {
        console.log("Insertando categorías e ingredientes...");
        for (const [catName, items] of Object.entries(data)) {
            // Verificar o crear categoría
            let [existing] = await db.query('SELECT id FROM categorias WHERE nombre = ?', [catName]);
            let catId;
            if (existing.length > 0) {
                catId = existing[0].id;
            } else {
                const color = categoryColors[catName] || '#D81B60';
                const [res] = await db.query('INSERT INTO categorias (nombre, color) VALUES (?, ?)', [catName, color]);
                catId = res.insertId;
                console.log(`Categoría creada: ${catName} (ID: ${catId})`);
            }

            // Insertar ingredientes
            for (const item of items) {
                const [check] = await db.query('SELECT id FROM lista_compras WHERE nombre = ?', [item]);
                if (check.length === 0) {
                    await db.query('INSERT INTO lista_compras (nombre, cantidad, categoria_id, comprado) VALUES (?, ?, ?, ?)', 
                        [item, '', catId, false]);
                }
            }
        }
        console.log("¡Ingredientes y categorías insertados con éxito!");
        process.exit(0);
    } catch (err) {
        console.error("Error en seed:", err);
        process.exit(1);
    }
}

seed();
