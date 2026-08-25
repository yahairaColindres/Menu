const db = require('./db');

const categoriesToEnsure = [
    { nombre: "Ensaladas", color: "#4CAF50" },
    { nombre: "Complemento", color: "#FF9800" },
    { nombre: "Plato Fuerte", color: "#E91E63" },
    { nombre: "Postres", color: "#9C27B0" }
];

const recipesData = [
    // ENSALADAS
    { nombre: "Vegetales al vapor", categoria: "Ensaladas", tiempo: "20 min", imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80", instrucciones: "Cocinar los vegetales mixtos al vapor hasta que estén al dente. Sazonar con mantequilla, sal y pimienta." },
    { nombre: "Ensalada de lechuga", categoria: "Ensaladas", tiempo: "10 min", imagen: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80", instrucciones: "Lavar y trocear lechuga fresca. Aderezar con aceite de oliva, limón y sal." },
    { nombre: "Ensalada con cherry", categoria: "Ensaladas", tiempo: "15 min", imagen: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80", instrucciones: "Mezclar lechugas variadas, tomates cherry cortados a la mitad, queso y vinagreta balsámica." },
    { nombre: "Ensalada de tomate", categoria: "Ensaladas", tiempo: "10 min", imagen: "https://images.unsplash.com/photo-1592417817098-8f3d6ef23a80?auto=format&fit=crop&w=800&q=80", instrucciones: "Rebanar tomates jugosos, agregar cebolla morada, orégano, sal y aceite de oliva." },
    { nombre: "Ensalada de pepino", categoria: "Ensaladas", tiempo: "10 min", imagen: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", instrucciones: "Cortar pepinos en rodajas finas, marinar con vinagre, limón, pimienta y sal." },
    { nombre: "Ensalada de repollo con limón", categoria: "Ensaladas", tiempo: "15 min", imagen: "https://images.unsplash.com/photo-1625944525533-473f1a3d54e7?auto=format&fit=crop&w=800&q=80", instrucciones: "Rallar el repollo finamente, mezclar con abundante jugo de limón, sal y culantro." },
    { nombre: "Ensalada de repollo con mayonesa", categoria: "Ensaladas", tiempo: "15 min", imagen: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80", instrucciones: "Mezclar repollo rallado, zanahoria rallada, mayonesa, toque de azúcar y vinagre." },
    { nombre: "Ensalada de remolacha con huevo", categoria: "Ensaladas", tiempo: "25 min", imagen: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80", instrucciones: "Cocer remolachas y huevos. Cortar en cubos y condimentar con mayonesa o vinagreta." },
    { nombre: "Ensalada de papa con huevo", categoria: "Ensaladas", tiempo: "30 min", imagen: "https://images.unsplash.com/photo-1568899466260-b6d4e56e8e42?auto=format&fit=crop&w=800&q=80", instrucciones: "Hervir papas y huevos duros. Mezclar en cubos con mayonesa, apio picado, sal y pimienta." },
    { nombre: "Coliflor en margarina", categoria: "Ensaladas", tiempo: "20 min", imagen: "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=800&q=80", instrucciones: "Cocer ramilletes de coliflor. Saltear en sartén con abundante margarina y pimienta." },
    { nombre: "Brócoli cocido", categoria: "Ensaladas", tiempo: "15 min", imagen: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&q=80", instrucciones: "Blanquear el brócoli en agua hirviendo con sal durante 5 min. Servir con un chorrito de aceite de oliva." },

    // COMPLEMENTO
    { nombre: "Puré de papa", categoria: "Complemento", tiempo: "25 min", imagen: "https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=800&q=80", instrucciones: "Hervir papas peladas, triturar caliente con mantequilla, leche, sal y nuez moscada." },
    { nombre: "Papa al horno con jamón y queso", categoria: "Complemento", tiempo: "45 min", imagen: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80", instrucciones: "Hornear la papa, ahuecar y rellenar con crema, jamón picado y queso mozzarella derretido." },
    { nombre: "Papa al horno", categoria: "Complemento", tiempo: "50 min", imagen: "https://images.unsplash.com/photo-1600289031464-68d1740d24eb?auto=format&fit=crop&w=800&q=80", instrucciones: "Envolver papas en aluminio con mantequilla y sal gruesa, hornear a 200°C." },
    { nombre: "Papa cocida", categoria: "Complemento", tiempo: "20 min", imagen: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80", instrucciones: "Cocer papas enteras con sal hasta que estén suaves. Servir con cilantro fresco." },
    { nombre: "Papa cocida y frita en rodajas grandes", categoria: "Complemento", tiempo: "30 min", imagen: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80", instrucciones: "Hervir papas en rodajas gruesas y luego freír en aceite caliente hasta dorar por ambos lados." },
    { nombre: "Coditos con jamón", categoria: "Complemento", tiempo: "20 min", imagen: "https://images.unsplash.com/photo-1621996346565-e3d5d6281292?auto=format&fit=crop&w=800&q=80", instrucciones: "Cocer pasta de coditos, mezclar con crema de leche, jamón en cubos y queso rallado." },
    { nombre: "Coditos con mayonesa", categoria: "Complemento", tiempo: "20 min", imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80", instrucciones: "Mezclar coditos cocidos fríos con mayonesa, granos de maíz y cilantro picado." },

    // PLATO FUERTE
    { nombre: "Arroz con pollo", categoria: "Plato Fuerte", tiempo: "45 min", imagen: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=800&q=80", instrucciones: "Cocinar pollo con soffritto de vegetales, incorporar arroz y caldo hasta granear." },
    { nombre: "Tacos de pollo", categoria: "Plato Fuerte", tiempo: "30 min", imagen: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80", instrucciones: "Desmenuzar pollo sazonado, enrollar en tortillas de maíz y freír bien crujientes." },
    { nombre: "Pastelitos de carne molida", categoria: "Plato Fuerte", tiempo: "35 min", imagen: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80", instrucciones: "Rellenar discos de masa con carne molida sazonada y freír hasta dorar." },
    { nombre: "Pastelitos de papa", categoria: "Plato Fuerte", tiempo: "35 min", imagen: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80", instrucciones: "Rellenar masa con puré de papa guisado con especias y freír en aceite caliente." },
    { nombre: "Enchiladas de pollo", categoria: "Plato Fuerte", tiempo: "40 min", imagen: "https://images.unsplash.com/photo-1534352956036-cd81e27dd615?auto=format&fit=crop&w=800&q=80", instrucciones: "Tortillas fritas cubiertas con pollo desmenuzado, repollo, huevo duro, queso y salsa roja." },
    { nombre: "Enchiladas de carne molida", categoria: "Plato Fuerte", tiempo: "40 min", imagen: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80", instrucciones: "Tortillas crujientes con carne molida sazonada, repollo rallado, queso duro y salsa casera." },
    { nombre: "Nachos con queso y carne molida", categoria: "Plato Fuerte", tiempo: "25 min", imagen: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80", instrucciones: "Capa de totopos cubierta de carne molida, queso cheddar fundido y jalapeños." },
    { nombre: "Lasagna de carne", categoria: "Plato Fuerte", tiempo: "1 hora", imagen: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80", instrucciones: "Láminas de pasta alternadas con bolognesa, salsa bechamel y queso mozzarella al horno." },
    { nombre: "Canelones de pollo", categoria: "Plato Fuerte", tiempo: "50 min", imagen: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80", instrucciones: "Canelones rellenos de pollo cremoso, gratinados con salsa blanca y queso." },
    { nombre: "Lasagna de pollo", categoria: "Plato Fuerte", tiempo: "55 min", imagen: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=800&q=80", instrucciones: "Pasta en capas con pollo desmenuzado en salsa bechamel y queso abundante." },
    { nombre: "Arroz blanco", categoria: "Plato Fuerte", tiempo: "20 min", imagen: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=800&q=80", instrucciones: "Sofreír arroz con ajo y cebolla, añadir agua hirviendo con sal y cocer a fuego lento." },
    { nombre: "Tacos mexicanos", categoria: "Plato Fuerte", tiempo: "25 min", imagen: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=800&q=80", instrucciones: "Tortillas suaves de maíz con carne asada o al pastor, cebolla, cilantro y salsa verde." },
    { nombre: "Carne molida", categoria: "Plato Fuerte", tiempo: "25 min", imagen: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80", instrucciones: "Guisar carne molida de res con tomates, papas en cubos, cebolla y comino." },
    { nombre: "Tajaditas con carne molida", categoria: "Plato Fuerte", tiempo: "35 min", imagen: "https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?auto=format&fit=crop&w=800&q=80", instrucciones: "Cama de tajadas de plátano verde fritas, cubiertas de carne molida, repollo y chismol." },
    { nombre: "Pollo enrollado con tocino", categoria: "Plato Fuerte", tiempo: "40 min", imagen: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=800&q=80", instrucciones: "Pechugas de pollo rellenas de queso, envueltas en tocino crujiente al horno." },
    { nombre: "Pollo y vegetales con salsa de ostra", categoria: "Plato Fuerte", tiempo: "25 min", imagen: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80", instrucciones: "Saltear en wok pollo en tiras, brócoli, pimientos y salsa de ostra." },
    { nombre: "Arroz amarillo", categoria: "Plato Fuerte", tiempo: "25 min", imagen: "https://images.unsplash.com/photo-1603105037880-880cd4edfb0d?auto=format&fit=crop&w=800&q=80", instrucciones: "Sazonar el arroz con achiote o azafrán, maíz dulce y arvejas." },
    { nombre: "Arroz jardinero", categoria: "Plato Fuerte", tiempo: "30 min", imagen: "https://images.unsplash.com/photo-1596560548464-f010549b84d7?auto=format&fit=crop&w=800&q=80", instrucciones: "Arroz variado con zanahorias, judías verdes, maíz, pimientos y hierbas." },
    { nombre: "Pollo al horno", categoria: "Plato Fuerte", tiempo: "1 hora", imagen: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=800&q=80", instrucciones: "Marinar pollo entero o en piezas con especias, naranja agria y asar a dorar." },
    { nombre: "Pollo agridulce", categoria: "Plato Fuerte", tiempo: "35 min", imagen: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=800&q=80", instrucciones: "Pollo frito salteado en salsa agridulce con piña, cebolla y pimientos." },
    { nombre: "Carne guisada", categoria: "Plato Fuerte", tiempo: "50 min", imagen: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80", instrucciones: "Carne de res tierna guisada con papas, zanahorias y salsa de tomate concentrada." },
    { nombre: "Bistec con papas", categoria: "Plato Fuerte", tiempo: "35 min", imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80", instrucciones: "Bistec de res salteado con cebolla en aros, tomates y papas fritas." },
    { nombre: "Hígado con papas", categoria: "Plato Fuerte", tiempo: "30 min", imagen: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80", instrucciones: "Hígado sazonado encebollado con papas frotadas en sartén." },
    { nombre: "Espaguetis con carne", categoria: "Plato Fuerte", tiempo: "30 min", imagen: "https://images.unsplash.com/photo-1622973536968-3ead9e780960?auto=format&fit=crop&w=800&q=80", instrucciones: "Pasta servida con abundante salsa bolognesa de carne molida y queso parmesano." },
    { nombre: "Pollo a la plancha", categoria: "Plato Fuerte", tiempo: "20 min", imagen: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80", instrucciones: "Filete de pechuga marinada al limón y hierbas, cocinada a la plancha caliente." },
    { nombre: "Chop suey casero", categoria: "Plato Fuerte", tiempo: "30 min", imagen: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80", instrucciones: "Vegetales salteados finamente con pollo, carne de res, salsa soya y fideos." },
    { nombre: "Sopa de tortilla", categoria: "Plato Fuerte", tiempo: "40 min", imagen: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80", instrucciones: "Caldo de tomate y chile guajillo servido con tortillas fritas, aguacate y crema." },
    { nombre: "Sopa Maggi", categoria: "Plato Fuerte", tiempo: "15 min", imagen: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80", instrucciones: "Sopa de fideos o tortilla sazonada caliente con verdura fresca." },
    { nombre: "Marmahón", categoria: "Plato Fuerte", tiempo: "35 min", imagen: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80", instrucciones: "Pasta de marmahón guisada con vegetes, pechuga de pollo y especias orientales." },

    // POSTRES
    { nombre: "Pastel de Chocolate", categoria: "Postres", tiempo: "45 min", imagen: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80", instrucciones: "Bizcocho esponjoso de cacao cubierto de ganache de chocolate." },
    { nombre: "Flan de Vainilla", categoria: "Postres", tiempo: "50 min", imagen: "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80", instrucciones: "Postre cremoso de huevo y leche cocido a baño maría sobre caramelo fluido." }
];

async function seedRecipes() {
    try {
        console.log("Asegurando categorías de recetas...");
        const categoryMap = {};

        for (const cat of categoriesToEnsure) {
            let [rows] = await db.query('SELECT id FROM categorias WHERE nombre = ?', [cat.nombre]);
            if (rows.length > 0) {
                categoryMap[cat.nombre] = rows[0].id;
            } else {
                const [res] = await db.query('INSERT INTO categorias (nombre, color) VALUES (?, ?)', [cat.nombre, cat.color]);
                categoryMap[cat.nombre] = res.insertId;
                console.log(`Categoría creada: ${cat.nombre}`);
            }
        }

        console.log("Insertando y actualizando recetas con fotografías...");
        for (const recipe of recipesData) {
            const catId = categoryMap[recipe.categoria] || null;
            let [existing] = await db.query('SELECT id FROM recetas WHERE nombre = ?', [recipe.nombre]);

            if (existing.length > 0) {
                await db.query(
                    'UPDATE recetas SET categoria_id = ?, tiempo = ?, imagen = ?, instrucciones = ? WHERE id = ?',
                    [catId, recipe.tiempo, recipe.imagen, recipe.instrucciones, existing[0].id]
                );
                console.log(`Receta actualizada: ${recipe.nombre}`);
            } else {
                await db.query(
                    'INSERT INTO recetas (nombre, tiempo, instrucciones, imagen, categoria_id) VALUES (?, ?, ?, ?, ?)',
                    [recipe.nombre, recipe.tiempo, recipe.instrucciones, recipe.imagen, catId]
                );
                console.log(`Receta insertada: ${recipe.nombre}`);
            }
        }

        console.log("¡Todas las recetas han sido guardadas y categorizadas exitosamente!");
        process.exit(0);
    } catch (err) {
        console.error("Error al procesar recetas:", err);
        process.exit(1);
    }
}

seedRecipes();
